
import { AgentExecutionPlan, PipelineStep } from "@Damba/core/AgentDefType";
import { runRouterStep } from "./runRouterStep";
import { buildExecutionRegistry } from "./buildExecutionRegistry";

export async function runPipelineEntry(opts: {
  executionPlan: AgentExecutionPlan;
  agentCtx: any;
  input: any;

  /**
   * Existing sub-agent executor from your runtime
   */
  runSubAgent: (subAgentId: string, input: any) => Promise<any>;

  /**
   * Existing LLM/router caller
   */
  callModel: (args: {
    systemPrompt: string;
    input: any;
    allowedRoutes: string[];
  }) => Promise<string>;

  /**
   * Optional tracing hook
   */
  onStepStart?: (step: PipelineStep, payload: any) => Promise<void> | void;
  onStepEnd?: (step: PipelineStep, result: any) => Promise<void> | void;
}) {
  const {
    executionPlan,
    agentCtx,
    input,
    runSubAgent,
    callModel,
    onStepStart,
    onStepEnd,
  } = opts;

  const entry = executionPlan.manifest.entry;

  if (entry.kind !== "pipeline") {
    throw new Error(`runPipelineEntry requires manifest.entry.kind = "pipeline"`);
  }

  const { lambdaRegistry, toolRegistry, subAgentRegistry } =
    await buildExecutionRegistry({
      executionPlan,
      agentCtx,
      runSubAgent,
    });

  let currentPayload = input;

  for (const step of entry.steps) {
    if (onStepStart) {
      await onStepStart(step, currentPayload);
    }

    if (step.type === "lambda") {
      const fn = lambdaRegistry[step.lambdaId];
      if (!fn) {
        throw new Error(`Unknown lambda step: ${step.lambdaId}`);
      }

      currentPayload = await fn(currentPayload);

      if (onStepEnd) {
        await onStepEnd(step, currentPayload);
      }
      continue;
    }

    if (step.type === "tool") {
      const fn = toolRegistry[step.toolName];
      if (!fn) {
        throw new Error(`Unknown tool step: ${step.toolName}`);
      }

      currentPayload = await fn(currentPayload);

      if (onStepEnd) {
        await onStepEnd(step, currentPayload);
      }
      continue;
    }

    if (step.type === "subAgent") {
      const fn = subAgentRegistry[step.subAgentId];
      if (!fn) {
        throw new Error(`Unknown subAgent step: ${step.subAgentId}`);
      }

      currentPayload = await fn(currentPayload);

      if (onStepEnd) {
        await onStepEnd(step, currentPayload);
      }
      continue;
    }

    if (step.type === "router") {
      const selectedSubAgentId = await runRouterStep({
        router: step.router,
        input: currentPayload,
        agentCtx,
        callModel,
      });

      const fn = subAgentRegistry[selectedSubAgentId];
      if (!fn) {
        throw new Error(`Router selected unknown subAgent: ${selectedSubAgentId}`);
      }

      currentPayload = await fn(currentPayload);

      if (onStepEnd) {
        await onStepEnd(step, currentPayload);
      }
      continue;
    }

    throw new Error(`Unsupported pipeline step type: ${(step as any).type}`);
  }

  return currentPayload;
}