/* eslint-disable @typescript-eslint/no-explicit-any */
import { executeNodeVmTool } from './executeNodeVmTool';

export async function executeRunnableLambdaNodeVm(params: { lambda: any; input: any; ctx: any }) {
  return executeNodeVmTool({
    code: params.lambda.code,
    input: params.input,
    ctx: params.ctx,
    opts: {
      timeoutMs: params.lambda.timeoutMs ?? 1000,
      maxMemoryMb: 128,
    },
    meta: {
      runnableLambdaId: params.lambda.id,
      kind: params.lambda.kind,
    },
  });
}
