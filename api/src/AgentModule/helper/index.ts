/* eslint-disable @typescript-eslint/no-explicit-any */

import { DEvent } from "@App/damba.import";
import { AuditEvent, AuditEventType } from "@Database/entities/agents/contracts/AuditEvent";
import { AgentDefinition } from "@Database/entities/agents/contracts/Agents";
import { DambaApi } from "@Damba/v2/service/DambaService";

import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";

import Ajv from "ajv";
import path from "path";

const ajv = new Ajv({ allErrors: true });

// -----------------------------
// Utils
// -----------------------------
export function clampStr(s: any, max = 4000) {
  const x = String(s ?? "");
  return x.length > max ? x.slice(0, max) : x;
}

export function safeJsonParse(s: any, fallback: any = null) {
  try {
    return JSON.parse(String(s));
  } catch {
    return fallback;
  }
}

export function validateAssignmentConfig(inputsSchema: any | null, config: Record<string, any>) {
  if (!inputsSchema) return true;
  const validate = ajv.compile(inputsSchema);
  const ok = validate(config);
  if (!ok) throw new Error(`Invalid assignment config: ${ajv.errorsText(validate.errors)}`);
  return true;
}

export async function audit(
  api: DambaApi | undefined,
  e: DEvent,
  args: {
    type: AuditEventType;
    orgId?: string | null;
    resourceType?: string | null;
    resourceId?: string | null;
    metadata?: any;
  }
) {
  try {
    const repo = api?.DRepository();
    if (!repo) return;

    const evt: any = new AuditEvent();
    evt.type = args.type;
    evt.orgId = args.orgId ?? e.in.payload?.orgId ?? null;
    evt.actorUserId = e.in.payload?.id ?? null;
    evt.resourceType = args.resourceType ?? null;
    evt.resourceId = args.resourceId ?? null;
    evt.metadata = args.metadata ?? null;

    await repo.DSave(AuditEvent, evt);
  } catch {
    // never fail business flow because of audit
  }
}

// -----------------------------
// Qdrant helper
// -----------------------------
export type PreDocs = {
  content: string;
  metadata?: Record<string, any>;
};

export async function buildQdrantRetriever(
  name: string,
  preDocs: PreDocs[],
  model = "text-embedding-3-small",
  k = 5
) {
  const docs = preDocs.map(
    (d) =>
      new Document({
        pageContent: d.content,
        metadata: { ...(d.metadata ?? {}) },
      })
  );

  const embeddings = new OpenAIEmbeddings({ model });

  const vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, {
    url: process.env.QDRANT_URL || "http://localhost:6333",
    collectionName: name,
  });

  return vectorStore.asRetriever({ k });
}

// -----------------------------
// Marketplace types
// -----------------------------
export type MarketplaceAgentContext = {
  request: string;
  config: Record<string, any>;
  payload: any;
  deps: {
    openAi: any;
    tools: Record<string, any>;
  };
  runtime?: {
    orgId: string;
    scopeType?: string;
    scopeId?: string;
    architectureAst?: any;
    assignmentId?: string;
    agentDefinitionId?: string;
    runId?: string;
  };
};

export type MarketplaceAgentResult = {
  content: string;
  trace?: any;
  proposalPatch?: any | null;
};

// -----------------------------
// Tool Registry (V2)
// -----------------------------
export type ToolInvoke = (args: any) => Promise<any>;

export type ToolLike = {
  name: string;
  description?: string;
  invoke: ToolInvoke;
  // optional internal metadata
  __type?: string;
};

export type ToolTraceEntry = {
  ts: string;
  tool: string;
  input?: any;
  ok: boolean;
  ms?: number;
  error?: string;
};

export type BuildToolRegistryArgs = {
  e: DEvent;
  assignmentConfig: any;
  overrides: any;

  // optional: enable filtering and policy enforcement
  agent?: AgentDefinition | null;

  // optional: extra allow/deny controls
  allowTools?: string[]; // explicit allow list (by tool name)
  denyTools?: string[]; // explicit deny list (by tool name)
};

/**
 * Normalize any injected tool into a consistent interface:
 * { name, description, invoke(args) }
 */
export function normalizeTool(name: string, tool: any, description?: string): ToolLike | null {
  if (!tool) return null;

  // Already ToolLike
  if (typeof tool?.invoke === "function") {
    return {
      name: tool.name ?? name,
      description: tool.description ?? description,
      invoke: tool.invoke.bind(tool),
      __type: tool.__type ?? "custom",
    };
  }

  // Some runtimes inject tavily as an object with invoke()
  if (typeof tool?.invoke === "function") {
    return { name, description, invoke: tool.invoke.bind(tool), __type: "custom" };
  }

  return null;
}

export function wrapInvokeWithTrace(tool: ToolLike, trace: ToolTraceEntry[]): ToolLike {
  return {
    ...tool,
    invoke: async (args: any) => {
      const t0 = Date.now();
      try {
        const out = await tool.invoke(args);
        trace.push({
          ts: new Date().toISOString(),
          tool: tool.name,
          input: args,
          ok: true,
          ms: Date.now() - t0,
        });
        return out;
      } catch (err: any) {
        trace.push({
          ts: new Date().toISOString(),
          tool: tool.name,
          input: args,
          ok: false,
          ms: Date.now() - t0,
          error: clampStr(err?.message ?? String(err), 1200),
        });
        throw err;
      }
    },
  };
}

/**
 * Extract allowed tool names from agentManifest.tools (if present)
 */
export function manifestAllowedToolNames(agent?: AgentDefinition | null): string[] | null {
  const manifest = (agent as any)?.agentManifest;
  const tools = manifest?.tools;
  if (!Array.isArray(tools)) return null;
  return tools
    .filter((t: any) => t && t.enabled !== false && typeof t.name === "string")
    .map((t: any) => t.name);
}

/**
 * Apply allow/deny filters.
 */
export function applyToolFilters(
  reg: Record<string, ToolLike>,
  opts: { allow?: string[] | null; deny?: string[] | null }
) {
  const allow = opts.allow && opts.allow.length ? new Set(opts.allow) : null;
  const deny = opts.deny && opts.deny.length ? new Set(opts.deny) : null;

  for (const key of Object.keys(reg)) {
    const t = reg[key];
    const n = t?.name ?? key;

    if (deny && deny.has(n)) {
      delete reg[key];
      continue;
    }
    if (allow && !allow.has(n)) {
      delete reg[key];
      continue;
    }
  }
}

/**
 * V2 Registry builder:
 * - builds all runtime tools
 * - filters them based on agent manifest tool registry (if defined)
 * - wraps invoke() with tracing
 * - exposes trace on reg.__trace
 */
export function buildToolRegistryV2(args: BuildToolRegistryArgs) {
  const { e, assignmentConfig, overrides, agent, allowTools, denyTools } = args;

  const reg: Record<string, ToolLike> = {};
  const trace: ToolTraceEntry[] = [];

  // --- Tavily (web search)
  if (e.in.tavily) {
    const tavilyTool: ToolLike = {
      name: "tavily_search",
      description: "Search the web using Tavily",
      __type: "tavily_search",
      invoke: async (raw: any) => {
        const query = String(raw?.query ?? "").trim();
        const maxResults = Math.min(
          Math.max(Number(raw?.maxResults ?? overrides?.maxResults ?? assignmentConfig?.maxResults ?? 5), 1),
          10
        );
        if (!query) throw new Error("query required");
        return e.in.tavily.invoke({ query, maxResults });
      },
    };
    reg["tavily_search"] = wrapInvokeWithTrace(tavilyTool, trace);
  }

  // --- Qdrant retriever
  // If runtime injects a complete tool => use it
  if (e.in.retrieverTool) {
    const t = normalizeTool("qdrant_retriever", e.in.retrieverTool, "Retrieve relevant documents from Qdrant");
    if (t) reg["qdrant_retriever"] = wrapInvokeWithTrace({ ...t, name: "qdrant_retriever", __type: "qdrant_retriever" }, trace);
  } else if (e.in.qdrantRetriever) {
    const qdrantTool: ToolLike = {
      name: "qdrant_retriever",
      description: "Retrieve relevant documents from Qdrant",
      __type: "qdrant_retriever",
      invoke: async (raw: any) => {
        const query = String(raw?.query ?? "").trim();
        if (!query) throw new Error("query required");
        const docs = await e.in.qdrantRetriever.getRelevantDocuments(query);
        return (docs ?? []).map((d: any) => ({
          content: d.pageContent ?? d.content ?? "",
          path: d.metadata?.path,
          metadata: d.metadata ?? {},
        }));
      },
    };
    reg["qdrant_retriever"] = wrapInvokeWithTrace(qdrantTool, trace);
  }

  // --- Propose patch tool (safe, no apply)
  reg["damba_propose_patch"] = wrapInvokeWithTrace(
    {
      name: "damba_propose_patch",
      description: "Propose an architecture AST patch (do not apply directly).",
      __type: "damba_propose_patch",
      invoke: async (raw: any) => ({ patch: raw?.patch ?? raw, ok: true }),
    },
    trace
  );

  // --- Architecture read tool (stub, wire later)
  reg["damba_architecture_read"] = wrapInvokeWithTrace(
    {
      name: "damba_architecture_read",
      description: "Read current architecture AST (read-only).",
      __type: "damba_architecture_read",
      invoke: async () => ({ ast: null, note: "Wire to your Architecture service here." }),
    },
    trace
  );

  // --- Custom injected tools registry: e.in.tools = { [name]: tool }
  if ((e.in as any).tools && typeof (e.in as any).tools === "object") {
    for (const [k, v] of Object.entries((e.in as any).tools)) {
      const t = normalizeTool(k, v, `Custom tool: ${k}`);
      if (t) reg[k] = wrapInvokeWithTrace({ ...t, name: t.name ?? k, __type: t.__type ?? "custom" }, trace);
    }
  }

  // -----------------------------
  // Filters: manifest allowlist + overrides + explicit allow/deny
  // -----------------------------
  const manifestAllow = manifestAllowedToolNames(agent);
  const denyFromOverrides: string[] = [];
  const allowFromOverrides: string[] = [];

  // optional org-level disables
  if (overrides?.enableWeb === false) denyFromOverrides.push("tavily_search");
  if (overrides?.enableRag === false) denyFromOverrides.push("qdrant_retriever");

  // apply manifest allowlist if present
  if (manifestAllow) applyToolFilters(reg, { allow: manifestAllow, deny: null });

  // apply explicit allow/deny
  applyToolFilters(reg, { allow: allowTools ?? null, deny: denyTools ?? null });

  // apply overrides deny
  applyToolFilters(reg, { allow: null, deny: denyFromOverrides });

  // expose trace (non-enumerable is nice, but keep simple)
  (reg as any).__trace = trace;

  return reg;
}

/**
 * Backward-compatible wrapper:
 * Your current runAgentBehavior calls buildToolRegistry(e, assignmentConfig, overrides)
 * so we keep it.
 */
export function buildToolRegistry(e: DEvent, assignmentConfig: any, overrides: any) {
  return buildToolRegistryV2({ e, assignmentConfig, overrides, agent: null });
}

// -----------------------------
// Artifact execution (hardened import option)
// -----------------------------
function isSafeArtifactRef(ref: string) {
  // Optional allowlist base dir (recommended for marketplace)
  // Example: process.env.AGENT_ARTIFACT_BASEDIR="/var/app/agents"
  const base = process.env.AGENT_ARTIFACT_BASEDIR;
  if (!base) return true;

  // Resolve both to absolute and ensure ref is under base
  // NOTE: artifactRef could be a package name; if you allow that, skip this check.
  const absBase = path.resolve(base);
  const absRef = path.resolve(ref);

  return absRef.startsWith(absBase + path.sep) || absRef === absBase;
}

// -----------------------------
// Manifest execution (still fallback)
// -----------------------------
export async function runManifestAgent(params: {
  agent: AgentDefinition;
  ctx: MarketplaceAgentContext;
}): Promise<MarketplaceAgentResult> {
  const { agent, ctx } = params;

  const manifest = (agent as any).agentManifest ?? {};
  const sys = manifest?.entry?.systemPrompt ?? "You are a helpful assistant.";

  const { ChatPromptTemplate } = await import("@langchain/core/prompts");
  const { RunnableLambda } = await import("@langchain/core/runnables");

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", sys],
    ["user", "{q}"],
  ]);

  const toVars = new RunnableLambda({ func: () => ({ q: ctx.request }) });
  const toOut = new RunnableLambda({ func: (msg: any) => ({ content: String(msg?.content ?? "") }) });

  const chain = toVars.pipe(prompt).pipe(ctx.deps.openAi).pipe(toOut);
  const out = await chain.invoke({});

  // include tool trace if registry came from v2 builder
  const toolTrace = (ctx.deps.tools as any).__trace ?? [];

  return {
    content: clampStr(out?.content, 50000),
    trace: { mode: "manifest_fallback", toolTrace },
    proposalPatch: null,
  };
}

export function safeTrace(trace: any, maxChars: number) {
  try {
    return JSON.parse(clampStr(JSON.stringify(trace), maxChars));
  } catch {
    return { note: "trace_unserializable" };
  }
}