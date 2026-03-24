/* eslint-disable @typescript-eslint/no-explicit-any */
import { AgentRunJobPayload, AgentExecutionPlan } from "@Damba/core/AgentDefType";
import { MakeAiAgentProcessor, LlmProviderMap, DefaultLLM } from "..";
import { runPipelineEntry } from "../runtime/runPipelineEntry";
import { runSubAgentWithOpenAI } from "./runSubAgentWithOpenAI";
import { UnrecoverableError } from "bullmq";
import { ChatOpenAI } from "@langchain/openai";


// ------------------------------------------------------
// Job result type
// ------------------------------------------------------
export type AgentRunJobResult = {
  ok: boolean;
  agentRunId: string;
  correlationId: string;
  output: any;
};

// ------------------------------------------------------
// Context builder
// ------------------------------------------------------
function buildAgentCtx(data: AgentRunJobPayload) {
  return {
    meta: {
      agentRunId: data.agentRunId,
      orgId: data.orgId,
      userId: data.userId ?? null,
      scopeType: data.scopeType ?? null,
      scopeId: data.scopeId ?? null,
      correlationId: data.correlationId,
    },

    tools: {
      httpFetch: async (url: string, init?: RequestInit) => {
        const res = await fetch(url, {
          ...init,
          signal: AbortSignal.timeout(8000),
        });

        const text = await res.text();

        return {
          ok: res.ok,
          status: res.status,
          headers: Object.fromEntries(res.headers.entries()),
          body: text,
        };
      },

      dambaArchitectureRead: async (input: any) => {
        // TODO: brancher ton vrai service interne
        return {
          ok: true,
          source: "dambaArchitectureRead",
          input,
          data: null,
        };
      },

      dambaProposePatch: async (input: any) => {
        // TODO: brancher ton vrai service interne
        return {
          ok: true,
          source: "dambaProposePatch",
          input,
          patchId: null,
        };
      },

      tavilySearch: async (input: any) => {
        // TODO: brancher ton vrai provider
        return {
          ok: true,
          source: "tavilySearch",
          input,
          results: [],
        };
      },

      qdrantRetriever: async (input: any) => {
        // TODO: brancher ton vrai provider
        return {
          ok: true,
          source: "qdrantRetriever",
          input,
          documents: [],
        };
      },
    },
  };
}

// ------------------------------------------------------
// Generic model call
// ------------------------------------------------------
async function callModelWithOpenAI(args: {
  llm: ChatOpenAI;
  systemPrompt: string;
  input: any;
  allowedRoutes?: string[];
}) {
  const { llm, systemPrompt, input, allowedRoutes } = args;

  const routeHint =
    allowedRoutes && allowedRoutes.length > 0
      ? `\n\nAllowed routes: ${allowedRoutes.join(", ")}.\nReturn ONLY one exact route name.`
      : "";

  const response = await llm.invoke([
    {
      role: "system",
      content: `${systemPrompt}${routeHint}`,
    },
    {
      role: "user",
      content: typeof input === "string" ? input : JSON.stringify(input, null, 2),
    },
  ]);

  const text =
    typeof response.content === "string"
      ? response.content
      : Array.isArray(response.content)
      ? response.content
          .map((x: any) => (typeof x === "string" ? x : x?.text ?? ""))
          .join("\n")
      : "";

  return text.trim();
}

// ------------------------------------------------------
// Legacy simple entry runner
// ------------------------------------------------------
async function runSimpleEntry(args: {
  llm: ChatOpenAI;
  executionPlan: AgentExecutionPlan;
  input: any;
}) {
  const { llm, executionPlan, input } = args;
  const entry = executionPlan.manifest.entry;

  if (
    entry.kind !== "simple" &&
    entry.kind !== "multi_step" &&
    entry.kind !== "stateful" &&
    entry.kind !== "pipeline_no_agent" &&
    entry.kind !== "tool_only"
  ) {
    throw new Error(`Unsupported simple entry kind: ${entry.kind}`);
  }

  const systemPrompt = entry.systemPrompt ?? "You are a helpful agent.";

  const text = await callModelWithOpenAI({
    llm,
    systemPrompt,
    input,
  });

  return {
    kind: entry.kind,
    output: text,
  };
}

// ------------------------------------------------------
// Legacy router entry runner
// ------------------------------------------------------
async function runRouterEntry(args: {
  llm: ChatOpenAI;
  executionPlan: AgentExecutionPlan;
  input: any;
  agentCtx: any;
}) {
  const { llm, executionPlan, input, agentCtx } = args;
  const entry = executionPlan.manifest.entry;

  if (entry.kind !== "router") {
    throw new Error("runRouterEntry requires manifest.entry.kind = router");
  }

  const selectedRoute = await callModelWithOpenAI({
    llm,
    systemPrompt: entry.router.prompt,
    input,
    allowedRoutes: Object.keys(entry.router.routes),
  });

  const subAgentId = entry.router.routes[selectedRoute];
  if (!subAgentId) {
    throw new Error(`Router selected invalid route: ${selectedRoute}`);
  }

  return runSubAgentWithOpenAI({
    llm,
    executionPlan,
    subAgentId,
    input,
    agentCtx,
  });
}



// ------------------------------------------------------
// Main processor
// ------------------------------------------------------
export const agentRunProcessor: MakeAiAgentProcessor<
  AgentRunJobPayload,
  AgentRunJobResult,
  string,
  LlmProviderMap[typeof DefaultLLM]
> = (_config, llm) => {
  return async (job) => {
    try {
      const data = job.data as AgentRunJobPayload;

      if (!data?.executionPlan) {
        throw new UnrecoverableError("Missing executionPlan");
      }

      const entry = data.executionPlan.manifest.entry;
      if (!entry) {
        throw new UnrecoverableError("Missing manifest.entry");
      }

      const agentCtx = buildAgentCtx(data);

      const callModel = async (args: {
        systemPrompt: string;
        input: any;
        allowedRoutes: string[];
      }) => {
        const route = await callModelWithOpenAI({
          llm: llm as any,
          systemPrompt: args.systemPrompt,
          input: args.input,
          allowedRoutes: args.allowedRoutes,
        });

        return route;
      };

      const runSubAgent = async (subAgentId: string, input: any) => {
        return runSubAgentWithOpenAI({
          llm: llm as any,
          executionPlan: data.executionPlan,
          subAgentId,
          input,
          agentCtx,
        });
      };

      let output: any = null;

      // --------------------------------------------------
      // Pipeline entry
      // --------------------------------------------------
      if (entry.kind === "pipeline") {
        output = await runPipelineEntry({
          executionPlan: data.executionPlan,
          agentCtx,
          input: data.input,
          runSubAgent,
          callModel,
          onStepStart: async (step, payload) => {
            console.log("[agent-run][step-start]", {
              agentRunId: data.agentRunId,
              correlationId: data.correlationId,
              step,
              payload,
            });
          },
          onStepEnd: async (step, result) => {
            console.log("[agent-run][step-end]", {
              agentRunId: data.agentRunId,
              correlationId: data.correlationId,
              step,
              result,
            });
          },
        });
      }

      // --------------------------------------------------
      // Router entry
      // --------------------------------------------------
      else if (entry.kind === "router") {
        output = await runRouterEntry({
          llm: llm as any,
          executionPlan: data.executionPlan,
          input: data.input,
          agentCtx,
        });
      }

      // --------------------------------------------------
      // Simple / legacy entry
      // --------------------------------------------------
      else {
        output = await runSimpleEntry({
          llm: llm as any,
          executionPlan: data.executionPlan,
          input: data.input,
        });
      }

      return {
        ok: true,
        agentRunId: data.agentRunId,
        correlationId: data.correlationId,
        output,
      };
    } catch (err: any) {
      console.error("[agent-run][failed]", err);
      throw new UnrecoverableError(err?.message ?? "Unrecoverable agent run error");
    }
  };
};