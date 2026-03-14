/* eslint-disable @typescript-eslint/no-explicit-any */
// toolRunnerWorker.ts
import { parentPort, workerData } from 'node:worker_threads';
import vm from 'node:vm';

type MsgIn = {
  code: string;
  input: any;
  ctx: any;
};

function serializeError(err: any) {
  return {
    name: err?.name ?? 'Error',
    message: err?.message ?? String(err),
    stack: err?.stack ?? null,
  };
}

async function main() {
  const { code, input, ctx } = workerData as MsgIn;

  // ✅ sandbox globals: rien par défaut
  const sandbox: any = {
    console: {
      log: (...args: any[]) => parentPort?.postMessage({ type: 'log', data: args }),
      error: (...args: any[]) => parentPort?.postMessage({ type: 'log', data: args }),
    },
    // expose only what YOU want:
    ctx,
    input,

    // allow minimal primitives
    setTimeout,
    clearTimeout,
    TextEncoder,
    TextDecoder,
  };

  const context = vm.createContext(sandbox, {
    name: 'tool-sandbox',
    codeGeneration: { strings: false, wasm: false }, // blocks eval/new Function inside tool
  });

  // The tool code must set globalThis.run or export run.
  // We'll wrap it to capture a run function safely.
  const wrapped = `
    "use strict";
    const exports = {};
    const module = { exports };

    ${code}

    const runFn =
      (typeof run === "function" && run) ||
      (module.exports && typeof module.exports.run === "function" && module.exports.run) ||
      (exports && typeof exports.run === "function" && exports.run);

    if (!runFn) throw new Error("Tool must export a function: run(input, ctx)");

    globalThis.__RUN__ = runFn;
  `;

  const script = new vm.Script(wrapped, { filename: 'tool.js' });
  script.runInContext(context);

  const runFn = (context as any).__RUN__;
  const result = await runFn(input, ctx);

  parentPort?.postMessage({ type: 'result', data: result });
}

main().catch((err) => {
  parentPort?.postMessage({ type: 'error', error: serializeError(err) });
});
