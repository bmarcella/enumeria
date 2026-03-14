/* eslint-disable @typescript-eslint/no-explicit-any */

import { DEvent } from "@App/damba.import";
import {
  AgentDefinition,
  AgentAssignment,
  License,
  LicenseStatus,
  RunStatus,
  AgentProposal,
  ProposalStatus,
  AgentRun,
} from "@App/entities/agents/Agents";
import { OrgParams } from "@App/Validators/agents";
import { DambaApi, Behavior } from "@Damba/v2/service/DambaService";
import { RunRequestBody } from "../validators";
import {
  audit,
  buildToolRegistryV2,
  clampStr,
  MarketplaceAgentContext,
  runManifestAgent,
  safeTrace,
  validateAssignmentConfig,
} from "@App/AgentModule/helper";
import { AuditEventType } from "@App/entities/agents/AuditEvent";

export const runAgentBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();

    // -----------------------------
    // 1) Read + validate request
    // -----------------------------
    const { orgId } = OrgParams.parse(e.in.params);
    const body = RunRequestBody.parse(e.in.body ?? {});
    const request = (body.request ?? api?.params().query ?? "").trim();
    if (!request) throw new Error("request is required");

    // -----------------------------
    // 2) Load assignment
    // -----------------------------
    const assignment = await repo?.DGet1<AgentAssignment>(AgentAssignment, {
      where: { id: body.assignmentId, buyerOrgId: orgId },
    });

    if (!assignment) throw new Error("Assignment not found");
    if (!assignment.enabled) throw new Error("Assignment disabled");

    // -----------------------------
    // 3) License check
    // -----------------------------
    const license = await repo?.DGet1<License>(License, {
      where: { id: assignment.licenseId, buyerOrgId: orgId },
    });

    if (!license || license.status !== LicenseStatus.Active) {
      throw new Error("License inactive");
    }

    // -----------------------------
    // 4) Load agent definition
    // -----------------------------
    const agent = await repo?.DGet1<AgentDefinition>(AgentDefinition, {
      where: { id: assignment.agentDefinitionId },
    });
    if (!agent) throw new Error("Agent definition missing");

    // -----------------------------
    // 5) Validate assignment config against agent.inputsSchema
    // -----------------------------
    validateAssignmentConfig((agent as any).inputsSchema ?? null, assignment.config ?? {});

    // -----------------------------
    // 6) Create run record (Running)
    // -----------------------------
    const run = new AgentRun();
    run.buyerOrgId = orgId;
    run.assignmentId = assignment.id;
    run.status = RunStatus.Running;
    run.startedAt = new Date();
    run.inputSnapshot = {
      request,
      scopeType: assignment.scopeType,
      scopeId: assignment.scopeId,
      config: assignment.config ?? {},
      architectureAst: body.architectureAst ?? null,
      overrides: body.overrides ?? {},
    };

    const savedRun = await api?.DSave(run);

    // -----------------------------
    // 7) Audit: started
    // -----------------------------
    await audit(api, e, {
      type: AuditEventType.AGENT_RUN_STARTED,
      orgId,
      resourceType: "AgentRun",
      resourceId: savedRun?.id ?? null,
      metadata: {
        assignmentId: assignment.id,
        agentDefinitionId: assignment.agentDefinitionId,
        scopeType: assignment.scopeType,
        scopeId: assignment.scopeId,
      },
    });

    // -----------------------------
    // 8) Build tool registry (V2)
    // - supports multi tools, qdrant, custom tools
    // - filters by agentManifest.tools allowlist (if present)
    // - wraps invoke() with tool tracing
    // -----------------------------
    const toolsRegistry = buildToolRegistryV2({
      e,
      assignmentConfig: assignment.config ?? {},
      overrides: body.overrides ?? {},
      agent, // 👈 enable manifest tool allowlist filtering + future policy enforcement
    });

    // -----------------------------
    // 9) Build marketplace execution context
    // -----------------------------
    const ctx: MarketplaceAgentContext = {
      request,
      config: assignment.config ?? {},
      payload: e.in.payload,
      deps: {
        openAi: e.in.openAi,
        tools: toolsRegistry,
      },
      runtime: {
        orgId,
        scopeType: assignment.scopeType,
        scopeId: assignment.scopeId,
        architectureAst: body.architectureAst ?? null,
        assignmentId: assignment.id,
        agentDefinitionId: agent.id,
        runId: savedRun?.id,
      },
    };

    try {
      // -----------------------------
      // 10) Execute (artifact or manifest)
      // -----------------------------
      const manifestMode = (agent as any).agentManifest?.mode ?? "artifact";

      const out =  await runManifestAgent({ agent, ctx });

      // -----------------------------
      // 11) Persist run success
      // -----------------------------
      savedRun.status = RunStatus.Succeeded;
      savedRun.endedAt = new Date();
      savedRun.outputSummary = clampStr(out.content, 12000);

      // Store trace safely (toolTrace + agentTrace)
      (savedRun as any).trace = out.trace
        ? safeTrace(out.trace, 20000)
        : safeTrace({ toolTrace: (toolsRegistry as any).__trace ?? [], agentTrace: null }, 20000);

      await api?.DSave(savedRun);

      // -----------------------------
      // 12) Create proposal if patch exists
      // -----------------------------
      let proposal: AgentProposal | null = null;
      if (out.proposalPatch) {
        proposal = new AgentProposal();
        proposal.runId = savedRun.id;
        proposal.type = "ast_patch" as any;
        proposal.patch = out.proposalPatch;
        proposal.status = ProposalStatus.Proposed;

        proposal = await repo?.DSave(AgentProposal, proposal);
      }

      // -----------------------------
      // 13) Audit: succeeded
      // -----------------------------
      await audit(api, e, {
        type: AuditEventType.AGENT_RUN_SUCCEEDED,
        orgId,
        resourceType: "AgentRun",
        resourceId: savedRun?.id ?? null,
        metadata: {
          agentDefinitionId: agent.id,
          proposalId: proposal?.id ?? null,
          manifestMode,
        },
      });

      // -----------------------------
      // 14) Response
      // -----------------------------
      e.out.send({
        run: savedRun,
        proposal,
        content: out.content,
        trace: out.trace ?? null,
      });
    } catch (err: any) {
      // -----------------------------
      // 15) Persist run failure
      // -----------------------------
      savedRun.status = RunStatus.Failed;
      savedRun.endedAt = new Date();
      savedRun.error = clampStr(err?.message ?? String(err), 4000);

      // still store tool trace if available
      (savedRun as any).trace = safeTrace(
        { toolTrace: (toolsRegistry as any).__trace ?? [], agentTrace: null, error: savedRun.error },
        20000
      );

      await api?.DSave(savedRun);

      // -----------------------------
      // 16) Audit: failed
      // -----------------------------
      await audit(api, e, {
        type: AuditEventType.AGENT_RUN_FAILED,
        orgId,
        resourceType: "AgentRun",
        resourceId: savedRun?.id ?? null,
        metadata: {
          agentDefinitionId: assignment.agentDefinitionId,
          error: clampStr(err?.message ?? String(err), 2000),
        },
      });

      throw err;
    }
  };
};

// -------------------------------------------
// Local helper: safely store trace JSON
// -------------------------------------------
