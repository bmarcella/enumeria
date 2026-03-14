
import { ScopeType, RunTrigger, ProposalType } from "@App/entities/agents/Agents";
import { z } from "zod";

export const InstallAgentDto = z.object({
  agentDefinitionId: z.string().uuid(),
});

export const PurchaseAgentDto = z.object({
  agentDefinitionId: z.string().uuid(),
});

export const CreateAssignmentDto = z.object({
  agentDefinitionId: z.string().uuid(),
  scopeType: z.nativeEnum(ScopeType),
  scopeId: z.string().uuid(),
  enabled: z.boolean().optional().default(true),
  config: z.record(z.any()).optional().default({}),
  triggers: z.array(z.nativeEnum(RunTrigger)).optional().default([RunTrigger.Manual]),
});

export const CreateRunDto = z.object({
  assignmentId: z.string().uuid(),
  trigger: z.nativeEnum(RunTrigger).optional().default(RunTrigger.Manual),
  architectureAst: z.record(z.any()), // your Damba AST JSON
});

export const DecideProposalDto = z.object({
  decision: z.enum(["accept", "reject"]),
});

export const AgentRunnerOutput = z.object({
  outputSummary: z.string().optional(),
  proposal: z
    .object({
      type: z.nativeEnum(ProposalType).default(ProposalType.AstPatch),
      patch: z.record(z.any()),
    })
    .optional(),
});
export type AgentRunnerOutput = z.infer<typeof AgentRunnerOutput>;


export const OrgParams = z.object({
  orgId: z.string().uuid(),
});

export const BrowseAgentsQuery = z.object({
  q: z.string().optional(),
  roleType: z.string().optional(),
  priceType: z.string().optional(), // "free" | "one_time"
  tag: z.string().optional(),
});

export const InstallAgentBody = z.object({
  agentDefinitionId: z.string().uuid(),
});

export const PurchaseAgentBody = z.object({
  agentDefinitionId: z.string().uuid(),
});

export const CreateAssignmentBody = z.object({
  agentDefinitionId: z.string().uuid(),
  scopeType: z.nativeEnum(ScopeType),
  scopeId: z.string().uuid(),
  enabled: z.boolean().optional().default(true),
  config: z.record(z.any()).optional().default({}),
  triggers: z.array(z.nativeEnum(RunTrigger)).optional().default([RunTrigger.Manual]),
});

export const UpdateAssignmentBody = z.object({
  enabled: z.boolean().optional(),
  config: z.record(z.any()).optional(),
  triggers: z.array(z.nativeEnum(RunTrigger)).optional(),
});

export const RunAgentBody = z.object({
  assignmentId: z.string().uuid(),
  trigger: z.nativeEnum(RunTrigger).optional().default(RunTrigger.Manual),
  architectureAst: z.record(z.any()),
});

export const ProposalParams = z.object({
  proposalId: z.string().uuid(),
});

export const DecideProposalBody = z.object({
  decision: z.enum(["accept", "reject"]),
});