import { z } from 'zod';
import {
  AgentRoleType,
  AgentColor,
  AgentExecutionMode,
  PriceType,
  ScopeType,
  ProposalType,
  RunTrigger,
} from '@Database/entities/agents/contracts/Agents';

export const ToolTypeEnum = z.enum([
  'tavily_search',
  'qdrant_retriever',
  'http',
  'damba_architecture_read',
  'damba_propose_patch',
  'custom_http',
  'custom_plugin',
]);

export const ToolConfigSchema = z.object({
  name: z.string().min(1),
  type: ToolTypeEnum,
  enabled: z.boolean().optional().default(true),
  config: z.record(z.any()).optional().default({}),
});

const SubAgentSchema = z.object({
  id: z.string().min(1),
  kind: z
    .enum([
      'simple',
      'multi_step',
      'stateful',
      'rag',
      'tool_only',
      'pipeline_no_agent',
      'pipeline',
    ])
    .default('simple'),
  systemPrompt: z.string().optional().default(''),
  tools: z.array(z.string()).optional().default([]),
  maxIterations: z.number().int().min(1).max(50).optional().default(12),
  outputSchema: z.record(z.any()).optional(),
});

export const RunnableLambdaRefSchema = z.object({
  id: z.string().min(1),
  runnableLambdaId: z.string().uuid(),
});

export const PipelineStepSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('lambda'),
    lambdaId: z.string().min(1),
    name: z.string().optional(),
  }),
  z.object({
    type: z.literal('tool'),
    toolName: z.string().min(1),
    name: z.string().optional(),
  }),
  z.object({
    type: z.literal('subAgent'),
    subAgentId: z.string().min(1),
    name: z.string().optional(),
  }),
  z.object({
    type: z.literal('router'),
    name: z.string().optional(),
    router: z.object({
      prompt: z.string().min(1),
      routes: z.record(z.string()),
    }),
  }),
]);

export const EntryKindEnum = z.enum([
  'simple',
  'multi_step',
  'stateful',
  'router',
  'pipeline_no_agent',
  'tool_only',
  'pipeline',
]);

export const EntrySchema = z.object({
  kind: EntryKindEnum.default('simple'),
  systemPrompt: z.string().optional().default('You are a helpful assistant.'),
  router: z
    .object({
      prompt: z
        .string()
        .min(1)
        .default(
          'You are a router. Choose ONE route:\n- "default"\nReturn ONLY one word: default',
        ),
      routes: z.record(z.string()).default({ default: 'default' }),
    })
    .optional(),
  steps: z.array(PipelineStepSchema).optional().default([]),
});

export const AgentManifestSchema = z
  .object({
    version: z.string().min(1).default('1'),
    mode: z.enum(['artifact', 'manifest']).default('manifest'),
    entry: EntrySchema,
    subAgents: z.array(SubAgentSchema).optional().default([]),
    tools: z.array(ToolConfigSchema).optional().default([]),
    runnableLambdas: z.array(RunnableLambdaRefSchema).optional().default([]),
    defaults: z
      .object({
        model: z.string().optional().default('gpt-4o-mini'),
        temperature: z.number().min(0).max(2).optional().default(0.2),
        maxOutputChars: z.number().int().min(200).max(50000).optional().default(12000),
      })
      .optional()
      .default({}),
  })
  .superRefine((m, ctx) => {
    if (m.entry.kind === 'router' && !m.entry.router) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['entry', 'router'],
        message: "entry.router is required when entry.kind = 'router'",
      });
    }

    const subIds = (m.subAgents ?? []).map((s) => s.id);
    const subSeen = new Set<string>();
    for (const id of subIds) {
      if (subSeen.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['subAgents'],
          message: `Duplicate subAgent id: ${id}`,
        });
        break;
      }
      subSeen.add(id);
    }

    const toolNames = (m.tools ?? []).map((t) => t.name);
    const toolSeen = new Set<string>();
    for (const name of toolNames) {
      if (toolSeen.has(name)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['tools'],
          message: `Duplicate tool name: ${name}`,
        });
        break;
      }
      toolSeen.add(name);
    }

    const lambdaAliases = (m.runnableLambdas ?? []).map((l) => l.id);
    const lambdaSeen = new Set<string>();
    for (const id of lambdaAliases) {
      if (lambdaSeen.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['runnableLambdas'],
          message: `Duplicate runnableLambda alias id: ${id}`,
        });
        break;
      }
      lambdaSeen.add(id);
    }

    const toolNameSet = new Set(toolNames);
    const subIdSet = new Set(subIds);
    const lambdaIdSet = new Set(lambdaAliases);

    if (m.entry.kind === 'router' && m.entry.router) {
      for (const [routeName, subId] of Object.entries(m.entry.router.routes ?? {})) {
        if (!subIdSet.has(subId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['entry', 'router', 'routes', routeName],
            message: `Route "${routeName}" points to missing subAgentId "${subId}"`,
          });
        }
      }
    }

    for (let i = 0; i < (m.subAgents ?? []).length; i++) {
      const sub = m.subAgents[i];
      for (const toolName of sub.tools ?? []) {
        if (!toolNameSet.has(toolName)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['subAgents', i, 'tools'],
            message: `SubAgent "${sub.id}" references unknown tool "${toolName}"`,
          });
        }
      }
    }

    if (m.entry.kind === 'pipeline') {
      for (const [i, step] of (m.entry.steps ?? []).entries()) {
        if (step.type === 'lambda' && !lambdaIdSet.has(step.lambdaId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['entry', 'steps', i, 'lambdaId'],
            message: `Unknown lambda "${step.lambdaId}" (not found in runnableLambdas registry).`,
          });
        }

        if (step.type === 'tool' && !toolNameSet.has(step.toolName)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['entry', 'steps', i, 'toolName'],
            message: `Unknown tool "${step.toolName}" (not found in tools registry).`,
          });
        }

        if (step.type === 'subAgent' && !subIdSet.has(step.subAgentId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['entry', 'steps', i, 'subAgentId'],
            message: `Unknown subAgent "${step.subAgentId}" (not found in subAgents registry).`,
          });
        }

        if (step.type === 'router') {
          for (const [routeName, subId] of Object.entries(step.router.routes ?? {})) {
            if (!subIdSet.has(subId as any)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['entry', 'steps', i, 'router', 'routes', routeName],
                message: `Route "${routeName}" points to missing subAgentId "${subId}"`,
              });
            }
          }
        }
      }
    }
  });

export const CreateAgentDefinitionBodyBase = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(2).max(8000).optional().default(''),
  roleType: z.nativeEnum(AgentRoleType),
  emoji: z.string().min(1).max(12),
  color: z.nativeEnum(AgentColor),
  version: z.string().min(1).max(32).default('1.0.0'),
  executionMode: z.nativeEnum(AgentExecutionMode).default(AgentExecutionMode.Studio),
  scopes: z.array(z.string()).default([]),
  capabilities: z.array(z.string()).default([]),
  permissionsRequested: z.array(z.string()).default([]),
  inputsSchema: z.record(z.any()).nullable().optional().default(null),
  artifactRef: z.string().max(255).optional().default(''),
  agentManifest: AgentManifestSchema.nullable().optional().default(null),
});

export const CreateAgentDefinitionBody = CreateAgentDefinitionBodyBase;
export const UpdateAgentDefinitionBody = CreateAgentDefinitionBodyBase.partial();

export const AgentIdParams = z.object({
  agentDefinitionId: z.string().uuid(),
});

export const ModerationBody = z.object({
  reason: z.string().optional(),
});

export const ApprovalListingDefaults = z.object({
  createListing: z.boolean().optional().default(true),
  priceType: z.nativeEnum(PriceType).optional().default(PriceType.Free),
  priceCents: z.number().int().nonnegative().optional().default(0),
  currency: z.string().optional().default('USD'),
  tags: z.array(z.string()).optional().default([]),
});

export const ParamsSchema = z.object({
  agentDefinitionId: z.string().uuid(),
});

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
  architectureAst: z.record(z.any()),
});

export const DecideProposalDto = z.object({
  decision: z.enum(['accept', 'reject']),
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
  priceType: z.string().optional(),
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
  decision: z.enum(['accept', 'reject']),
});