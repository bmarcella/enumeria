/* eslint-disable @typescript-eslint/no-explicit-any */
// ../runtime/executeToolArtifactNodeVm.ts
import { Worker } from 'node:worker_threads';
import path from 'node:path';

export type ExecuteNodeVmToolOpts = {
  timeoutMs: number;
  maxMemoryMb: number;
};

export type ExecuteNodeVmToolParams = {
  code: string;
  input: any;
  ctx: any;
  opts: ExecuteNodeVmToolOpts;
  /**
   * If you want to pass extra metadata for debugging/logging:
   * ex: { toolArtifactId, correlationId }
   */
  meta?: Record<string, any>;
};

/**
 * Execute a custom tool in a worker_thread using node:vm.
 * - Hard timeout via worker.terminate()
 * - Memory bound via resourceLimits
 * - No require/imports inside sandbox (unless you explicitly expose)
 */
export async function executeNodeVmTool(params: ExecuteNodeVmToolParams): Promise<any> {
  const workerPath = path.resolve(process.cwd(), 'dist/tools/runtime/toolRunnerWorker.js'); // adjust to your build output
  const { timeoutMs, maxMemoryMb } = params.opts;
  return new Promise((resolve, reject) => {
    let settled = false;

    const w = new Worker(workerPath, {
      workerData: {
        code: params.code,
        input: params.input,
        ctx: params.ctx,
        meta: params.meta ?? {},
      },
      resourceLimits: {
        maxOldGenerationSizeMb: clampInt(maxMemoryMb, 16, 4096),
        maxYoungGenerationSizeMb: 16,
      },
    });

    const timer = setTimeout(async () => {
      if (settled) return;
      settled = true;
      try {
        await w.terminate();
      } finally {
        reject(new Error(`Tool execution timed out after ${timeoutMs}ms`));
      }
    }, timeoutMs);

    w.on('message', (msg) => {
      if (!msg || typeof msg !== 'object') return;

      if (msg.type === 'log') {
        // Optional: persist logs somewhere
        // console.log("[tool-log]", ...msg.data);
        return;
      }

      if (msg.type === 'result') {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        w.terminate().catch(() => {});
        resolve(msg.data);
        return;
      }

      if (msg.type === 'error') {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        w.terminate().catch(() => {});
        const e = new Error(msg?.error?.message ?? 'Tool error');
        (e as any).name = msg?.error?.name ?? 'Error';
        (e as any).stack = msg?.error?.stack ?? e.stack;
        reject(e);
      }
    });

    w.on('error', (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      w.terminate().catch(() => {});
      reject(err);
    });

    w.on('exit', (code) => {
      // If it exits without a result/error message and not settled => error
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(new Error(`Tool worker exited unexpectedly with code ${code}`));
    });
  });
}

function clampInt(n: number, min: number, max: number) {
  const x = Number.isFinite(n) ? Math.floor(n) : min;
  return Math.max(min, Math.min(max, x));
}
