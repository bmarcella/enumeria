import { AgentAssignment } from "@App/entities/agents/AgentsConfig";
import { OrgParams, CreateAssignmentBody, UpdateAssignmentBody } from "@App/Validators/agents";
import { Behavior, DambaApi } from "@Damba/v2/service/DambaService";
import { DEvent } from "@Damba/v2/service/DEvent";

export const createAssignmentBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const { orgId } = OrgParams.parse(e.in.params);
    const body = CreateAssignmentBody.parse(e.in.body);

    const agent = await e.in.extras.marketplace_extras.loadApprovedAgent(body.agentDefinitionId);
    const license = await e.in.extras.marketplace_extras.requireActiveLicense(orgId, body.agentDefinitionId);

    if (!agent.scopes?.includes(body.scopeType)) {
      throw new Error(`Agent does not support scopeType: ${body.scopeType}`);
    }

    e.in.extras.marketplace_extras.validateConfig(agent.inputsSchema, body.config);

    const assignment = new AgentAssignment();
    assignment.buyerOrgId = orgId;
    assignment.agentDefinitionId = body.agentDefinitionId;
    assignment.licenseId = license.id;
    assignment.scopeType = body.scopeType;
    assignment.scopeId = body.scopeId;
    assignment.enabled = body.enabled;
    assignment.config = body.config;
    assignment.triggers = body.triggers;
    assignment.createdByUserId = e.in.payload?.id ?? null;

    // ✅ This service entity is AgentAssignment, so api.DSave is allowed here
    const saved = await api?.DSave(assignment);

    e.out.send({ assignment: saved });
  };
};

export const listAssignmentsBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const { orgId } = OrgParams.parse(e.in.params);

    const scopeType = e.in.query?.scopeType;
    const scopeId = e.in.query?.scopeId;

    const where: any = { buyerOrgId: orgId };
    if (scopeType) where.scopeType = scopeType;
    if (scopeId) where.scopeId = scopeId;
    const assignments = await repo?.DGetAll<AgentAssignment>(AgentAssignment, { where });
    e.out.send({ assignments: assignments ?? [] });
  };
};

export const updateAssignmentBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const { orgId } = OrgParams.parse(e.in.params);
    const assignmentId = e.in.params?.assignmentId;

    const body = UpdateAssignmentBody.parse(e.in.body);

    const assignment = await repo?.DGet1<AgentAssignment>(AgentAssignment, {
      where: { id: assignmentId, buyerOrgId: orgId },
    });
    if (!assignment) throw new Error("Assignment not found");

    if (body.config) {
      const agent = await e.in.extras.marketplace_extras.loadApprovedAgent(assignment.agentDefinitionId);
      e.in.extras.marketplace_extras.validateConfig(agent.inputsSchema, body.config);
      assignment.config = body.config;
    }

    if (typeof body.enabled === "boolean") assignment.enabled = body.enabled;
    if (body.triggers) assignment.triggers = body.triggers;

    // ✅ still service entity => api.DSave OK
    const saved = await api?.DSave(assignment);

    e.out.send({ assignment: saved });
  };
};