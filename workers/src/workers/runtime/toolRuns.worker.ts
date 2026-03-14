/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// workers/toolRunsWorker.ts
import { Worker } from 'bullmq';

import connection from '@App/config/redis';
import { DQueues } from '@Damba/core/Queues';
import { buildToolCtx } from './nodevm/buildToolCtx';
import { executeNodeVmTool } from './nodevm/executeNodeVmTool';

export const toolRunsWorker = new Worker(
  DQueues.TOOlS_RUN,
  async (job) => {
    const { runId, orgId, tool, input, correlationId, permissionsGranted, scopeType, scopeId } =
      job.data as any;

    if (!tool) throw new Error('ToolArtifact not found');

    // (Optionnel) update run status DB: RUNNING
    await job.updateProgress({
      action: 'UPDATE_RUN_STATUS',
      status: 'running',
      runId,
      startedAt: new Date(),
    });

    const ctx = buildToolCtx({
      orgId,
      scopeType,
      scopeId,
      correlationId,
      permissionsGranted,
    });

    // si tu supportes inline code:
    const code = (tool as any).code; // ou tool.code si tu l’ajoutes
    if (!code) throw new Error('Tool has no inline code');

    const timeoutMs = (tool as any).limits?.timeoutMs ?? 20000;
    const maxMemoryMb = (tool as any).limits?.maxMemoryMb ?? 256;

    const output = await executeNodeVmTool({
      code,
      input,
      ctx,
      opts: { timeoutMs, maxMemoryMb },
    });

    await job.updateProgress({
      action: 'UPDATE_RUN_STATUS',
      status: 'succeeded',
      runId,
      endedAt: new Date(),
      output,
    });

    return output;
  },
  {
    connection,
    // Concurrency: combien de jobs BullMQ en parallèle
    concurrency: Number(process.env.TOOL_WORKER_CONCURRENCY ?? 5),
    // lockDuration: utile si jobs longs
    lockDuration: 60_000,
  },
);

toolRunsWorker.on('completed', (job) => {
  // console.log("completed", job.id)
});

toolRunsWorker.on('failed', async (job, err) => {
  // console.error("failed", job?.id, err)
});
