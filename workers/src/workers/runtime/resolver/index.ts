import { AgentExecutionPlan } from "@Damba/core/AgentDefType";
import { executeNodeVmTool } from "../nodevm/executeNodeVmTool";
import { validateWithJsonSchema } from "@App/workers/validateJsonSchema";


export function resolveRunnableLambdaHandler(opts: {
  lambdaId: string;
  executionPlan: AgentExecutionPlan;
  agentCtx: any;
}) {
  const lambda = opts.executionPlan.runnableLambdas.find((x) => x.id === opts.lambdaId);

  if (!lambda) {
    throw new Error(`RunnableLambda not found in executionPlan: ${opts.lambdaId}`);
  }

  return async (input: any) => {
    // 1) validate input
    validateWithJsonSchema({
      schema: lambda.inputSchema ?? null,
      data: input,
      label: `RunnableLambda(${lambda.name}) input`,
    });

    // 2) execute
    const result = await executeNodeVmTool({
      code: lambda.code,
      input,
      ctx: opts.agentCtx,
      opts: {
        timeoutMs: lambda.timeoutMs ?? 1000,
        maxMemoryMb: 128,
      },
      meta: {
        runnableLambdaId: lambda.runnableLambdaId,
        kind: lambda.kind,
        contentHash: lambda.contentHash,
      },
    });

    // 3) validate output
    validateWithJsonSchema({
      schema: lambda.outputSchema ?? null,
      data: result,
      label: `RunnableLambda(${lambda.name}) output`,
    });

    return result;
  };
}



export function resolveCustomToolHandler(opts: {
  toolName: string;
  executionPlan: AgentExecutionPlan;
  agentCtx: any;
}) {
  const tool = opts.executionPlan.tools.find((x) => x.name === opts.toolName);

  if (!tool) {
    throw new Error(`Tool not found in executionPlan: ${opts.toolName}`);
  }

  if (tool.runtime !== "node_vm") {
    throw new Error(`Unsupported tool runtime for now: ${tool.runtime}`);
  }

  if (tool.sourceType !== "inline_code" || !tool.code) {
    throw new Error(`Tool "${tool.name}" is not executable as inline_code`);
  }

  return async (input: any) => {
    // 1) validate input
    validateWithJsonSchema({
      schema: tool.inputSchema ?? null,
      data: input,
      label: `Tool(${tool.name}) input`,
    });

    // 2) execute
    const result = await executeNodeVmTool({
      code: tool.code!,
      input,
      ctx: opts.agentCtx,
      opts: {
        timeoutMs: tool.limits?.timeoutMs ?? 20000,
        maxMemoryMb: tool.limits?.maxMemoryMb ?? 256,
      },
      meta: {
        toolArtifactId: tool.toolArtifactId,
        contentHash: tool.contentHash,
      },
    });

    // 3) validate output
    validateWithJsonSchema({
      schema: tool.outputSchema ?? null,
      data: result,
      label: `Tool(${tool.name}) output`,
    });

    return result;
  };
}