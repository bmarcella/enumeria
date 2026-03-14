export type RunnableLambdaRef = {
  id: string;
  runnableLambdaId: string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export type AgentToolType =
  | 'tavily_search'
  | 'qdrant_retriever'
  | 'http'
  | 'damba_architecture_read'
  | 'damba_propose_patch'
  | 'custom_plugin'; // user-coded or packaged tool

export type AgentToolConfig = {
  name: string; // tool name exposed to sub-agents / pipelines
  type: AgentToolType;
  enabled?: boolean;
  config?: Record<string, any>;
};

export type AgentSubAgentKind =
  | 'simple'
  | 'multi_step'
  | 'stateful'
  | 'rag'
  | 'tool_only'
  | 'pipeline_no_agent';

export type AgentSubAgent = {
  id: string; // unique in manifest
  kind: AgentSubAgentKind;

  systemPrompt?: string;

  // allowed tool names (must match tools[].name)
  tools?: string[];

  // optional limits / behaviors
  maxIterations?: number;

  // optional: structured output schema descriptor (kept generic)
  outputSchema?: Record<string, any>;
};

export type PipelineStep =
  | { type: 'lambda'; lambdaId: string; name?: string }
  | { type: 'tool'; toolName: string; name?: string }
  | { type: 'subAgent'; subAgentId: string; name?: string }
  | {
      type: 'router';
      router: {
        prompt: string;
        routes: Record<string, string>;
      };
      name?: string;
    };

export type AgentEntry =
  | {
      kind: 'simple' | 'multi_step' | 'stateful' | 'pipeline_no_agent' | 'tool_only';
      systemPrompt?: string;
    }
  | {
      kind: 'router';
      systemPrompt?: string;
      router: {
        prompt: string; // "Return ONLY one word: codebase or web"
        routes: Record<string, string>; // routeName -> subAgentId
      };
    }
  | {
      kind: 'pipeline';
      steps: PipelineStep[];
    };

export type AgentManifest = {
  version: string; // manifest schema version
  /**
   * mode:
   * - "artifact": artifactRef must export runMarketplaceAgent(ctx)
   * - "manifest": runtime can build execution from manifest (router/subagents/tools)
   */
  entry: AgentEntry;

  // registry
  tools?: AgentToolConfig[];
  subAgents?: AgentSubAgent[];
  runnableLambdas?: RunnableLambdaRef[];
  // optional defaults for runtime
  defaults?: {
    model?: string;
    temperature?: number;
    maxOutputChars?: number;
  };
};

export type RunnableLambdaSnapshot = {
  id: string; // alias dans le manifest
  runnableLambdaId: string; // id DB réel
  name: string;
  version: string;
  kind: 'inline_transform' | 'inline_predicate' | 'inline_mapper' | 'inline_reducer';
  runtime: 'node_vm';
  code: string;
  timeoutMs: number;
  inputSchema?: Record<string, any> | null;
  outputSchema?: Record<string, any> | null;
  permissionsRequested?: string[];
  contentHash: string;
};

export type ToolArtifactSnapshot = {
  name: string; // nom exposé dans le manifest
  toolArtifactId: string;
  version: string;
  runtime: 'node_vm' | 'container' | 'wasm';
  sourceType: 'inline_code' | 'artifact_ref';
  code?: string | null;
  artifactRef?: string | null;
  inputSchema?: Record<string, any> | null;
  outputSchema?: Record<string, any> | null;
  permissionsRequested?: string[];
  limits?: {
    timeoutMs?: number;
    maxMemoryMb?: number;
  } | null;
  env?: Array<{ key: string; value?: string; secret?: boolean }> | null;
  contentHash: string;
};

export type AgentExecutionPlan = {
  manifest: AgentManifest;
  runnableLambdas: RunnableLambdaSnapshot[];
  tools: ToolArtifactSnapshot[];
};

export type AgentRunJobPayload = {
  agentRunId: string;
  orgId: string;
  userId?: string | null;
  scopeType?: string | null;
  scopeId?: string | null;
  correlationId: string;
  executionPlan: AgentExecutionPlan;
  input: any;
  tenantId?: string;
};
