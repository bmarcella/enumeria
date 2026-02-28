export type AgentToolType =
  | "tavily_search"
  | "qdrant_retriever"
  | "http"
  | "damba_architecture_read"
  | "damba_propose_patch"
  | "custom";

export type AgentToolConfig = {
  name: string; // tool name exposed to sub-agents / pipelines
  type: AgentToolType;
  enabled?: boolean;
  config?: Record<string, any>;
};

export type AgentSubAgentKind =
  | "simple"
  | "multi_step"
  | "stateful"
  | "rag"
  | "tool_only"
  | "pipeline_no_agent";

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

export type AgentEntry =
  | {
      kind: "simple" | "multi_step" | "stateful" | "pipeline_no_agent" | "tool_only";
      systemPrompt?: string;
    }
  | {
      kind: "router";
      systemPrompt?: string;
      router: {
        prompt: string; // "Return ONLY one word: codebase or web"
        routes: Record<string, string>; // routeName -> subAgentId
      };
    };

export type AgentManifest = {
  version: string; // manifest schema version
  /**
   * mode:
   * - "artifact": artifactRef must export runMarketplaceAgent(ctx)
   * - "manifest": runtime can build execution from manifest (router/subagents/tools)
   */
  mode: "artifact" | "manifest";

  entry: AgentEntry;

  // registry
  tools?: AgentToolConfig[];
  subAgents?: AgentSubAgent[];

  // optional defaults for runtime
  defaults?: {
    model?: string;
    temperature?: number;
    maxOutputChars?: number;
  };
};
