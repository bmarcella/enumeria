import { AgentToolConfig } from "@Damba/core/AgentDefType";

export function resolveBuiltinToolHandler(opts: {
  tool: AgentToolConfig;
  agentCtx: any;
}) {
  const { tool, agentCtx } = opts;

  if (tool.type === "http") {
    return async (input: any) => {
      if (!agentCtx?.tools?.httpFetch) {
        throw new Error("httpFetch not available in agentCtx");
      }

      const url = input?.url ?? tool.config?.url;
      const method = input?.method ?? tool.config?.method ?? "GET";
      const body = input?.body ?? undefined;
      const headers = input?.headers ?? tool.config?.headers ?? undefined;

      if (!url) {
        throw new Error(`Tool "${tool.name}" requires a url`);
      }

      return agentCtx.tools.httpFetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    };
  }

  if (tool.type === "damba_architecture_read") {
    return async (input: any) => {
      if (!agentCtx?.tools?.dambaArchitectureRead) {
        throw new Error("dambaArchitectureRead not available in agentCtx");
      }
      return agentCtx.tools.dambaArchitectureRead(input);
    };
  }

  if (tool.type === "damba_propose_patch") {
    return async (input: any) => {
      if (!agentCtx?.tools?.dambaProposePatch) {
        throw new Error("dambaProposePatch not available in agentCtx");
      }
      return agentCtx.tools.dambaProposePatch(input);
    };
  }

  if (tool.type === "tavily_search") {
    return async (input: any) => {
      if (!agentCtx?.tools?.tavilySearch) {
        throw new Error("tavilySearch not available in agentCtx");
      }
      return agentCtx.tools.tavilySearch(input);
    };
  }

  if (tool.type === "qdrant_retriever") {
    return async (input: any) => {
      if (!agentCtx?.tools?.qdrantRetriever) {
        throw new Error("qdrantRetriever not available in agentCtx");
      }
      return agentCtx.tools.qdrantRetriever(input);
    };
  }

  throw new Error(`Unsupported builtin tool type: ${tool.type}`);
}