import { AgentRoleType, AgentColor, AgentExecutionMode, PriceType } from "@App/entities/agents/AgentsConfig";
import z from "zod";

export const ToolTypeEnum = z.enum([
  "tavily_search",
  "qdrant_retriever",
  "http",
  "damba_architecture_read",
  "damba_propose_patch",
  "custom",
]);

export const ToolConfigSchema = z.object({
  name: z.string().min(1), // tool name exposed to agent/toolchain
  type: ToolTypeEnum,
  enabled: z.boolean().optional().default(true),
  // Type-specific config
  config: z.record(z.any()).optional().default({}),
});

const SubAgentSchema = z.object({
  id: z.string().min(1), // unique inside manifest
  kind: z.enum(["simple", "multi_step", "stateful", "rag", "tool_only", "pipeline_no_agent"]).default("simple"),
  // prompts
  systemPrompt: z.string().optional().default(""),
  routerPrompt: z.string().optional(), // optional for router agents
  // tools allowed to this sub-agent (by tool.name)
  tools: z.array(z.string()).optional().default([]),
  // optional limits
  maxIterations: z.number().int().min(1).max(50).optional().default(12),

  // optional: structured output schemas (json schema or zod-like descriptors)
  outputSchema: z.record(z.any()).optional(),
});

export const AgentManifestSchema = z.object({
  version: z.string().min(1).default("1"),
  mode: z.enum(["artifact", "manifest"]).default("artifact"),
  /**
   * mode=artifact:
   *   - artifactRef points to a module that exports runMarketplaceAgent(ctx)
   * mode=manifest:
   *   - runtime builds execution using this manifest (router + subagents + tools)
   */
  // Top-level behavior
  entry: z.object({
    kind: z.enum(["simple", "multi_step", "stateful", "router", "pipeline_no_agent", "tool_only"]).default("simple"),
    systemPrompt: z.string().optional().default("You are a helpful assistant."),
    // router entry selects a sub-agent
    router: z
      .object({
        prompt: z.string().min(1).default(
          `You are a router. Choose ONE route: ${"\n"}- "default"${"\n"}Return ONLY one word: default`
        ),
        routes: z.record(z.string()).default({ default: "default" }), // routeName -> subAgentId
      })
      .optional(),
  }),

  // Sub-agents pool
  subAgents: z.array(SubAgentSchema).optional().default([]),

  // Tools registry
  tools: z.array(ToolConfigSchema).optional().default([]),

  // Optional execution defaults
  defaults: z
    .object({
      model: z.string().optional().default("gpt-4o-mini"),
      temperature: z.number().min(0).max(2).optional().default(0.2),
      maxOutputChars: z.number().int().min(200).max(50000).optional().default(12000),
    })
    .optional()
    .default({}),
});

export const CreateAgentDefinitionBody = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(10),
  roleType: z.nativeEnum(AgentRoleType),
  emoji: z.string().min(1).max(12),
  color: z.nativeEnum(AgentColor),

  version: z.string().min(1).max(32).default("1.0.0"),
  executionMode: z.nativeEnum(AgentExecutionMode).default(AgentExecutionMode.Studio),

  scopes: z.array(z.string()).default([]),
  capabilities: z.array(z.string()).default([]),
  permissionsRequested: z.array(z.string()).default([]),
  // buyer-config validation schema (json schema)
  inputsSchema: z.record(z.any()).nullable().optional().default(null),
  // how to run this agent
  artifactRef: z.string().min(1).max(255),
  agentManifest: AgentManifestSchema.optional().default({
    version: "1",
    mode: "artifact",
    entry: { kind: "simple", systemPrompt: "You are a helpful assistant." },
    subAgents: [],
    tools: [],
    defaults: { model: "gpt-4o-mini", temperature: 0.2, maxOutputChars: 12000 },
  }),
});

export const UpdateAgentDefinitionBody = CreateAgentDefinitionBody.partial();

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
  currency: z.string().optional().default("USD"),
  tags: z.array(z.string()).optional().default([]),
});

export const ParamsSchema = z.object({
  agentDefinitionId: z.string().uuid(),
});
