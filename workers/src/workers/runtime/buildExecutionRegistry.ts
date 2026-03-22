import { AgentExecutionPlan } from "@Damba/core/AgentDefType";
import { resolveBuiltinToolHandler } from ".";
import { resolveRunnableLambdaHandler, resolveCustomToolHandler } from "./resolver";


export type ExecutionRegistry = {
  lambdaRegistry: Record<string, (input: any) => Promise<any>>;
  toolRegistry: Record<string, (input: any) => Promise<any>>;
  subAgentRegistry: Record<string, (input: any) => Promise<any>>;
};

export async function buildExecutionRegistry(opts: {
  executionPlan: AgentExecutionPlan;
  agentCtx: any;
  runSubAgent: (subAgentId: string, input: any) => Promise<any>;
}): Promise<ExecutionRegistry> {
  const { executionPlan, agentCtx, runSubAgent } = opts;

  const lambdaRegistry: Record<string, (input: any) => Promise<any>> = {};
  const toolRegistry: Record<string, (input: any) => Promise<any>> = {};
  const subAgentRegistry: Record<string, (input: any) => Promise<any>> = {};

  // --------------------------------------------------
  // Runnable Lambdas
  // --------------------------------------------------
  for (const lambdaRef of executionPlan.manifest.runnableLambdas ?? []) {
    if (!lambdaRef?.id) {
      throw new Error("Invalid runnable lambda ref: missing id");
    }

    lambdaRegistry[lambdaRef.id] = resolveRunnableLambdaHandler({
      lambdaId: lambdaRef.id,
      executionPlan,
      agentCtx,
    });
  }

  // --------------------------------------------------
  // Tools
  // --------------------------------------------------
  for (const tool of executionPlan.manifest.tools ?? []) {
    if (!tool?.name) {
      throw new Error("Invalid tool config: missing name");
    }

    if (tool.enabled === false) continue;

    if (tool.type === "custom_plugin") {
      toolRegistry[tool.name] = resolveCustomToolHandler({
        toolName: tool.name,
        executionPlan,
        agentCtx,
      });
      continue;
    }

    toolRegistry[tool.name] = resolveBuiltinToolHandler({
      tool,
      agentCtx,
    });
  }

  // --------------------------------------------------
  // SubAgents
  // --------------------------------------------------
  for (const subAgent of executionPlan.manifest.subAgents ?? []) {
    if (!subAgent?.id) {
      throw new Error("Invalid subAgent config: missing id");
    }

    subAgentRegistry[subAgent.id] = async (input: any) => {
      return runSubAgent(subAgent.id, input);
    };
  }

  return {
    lambdaRegistry,
    toolRegistry,
    subAgentRegistry,
  };
}