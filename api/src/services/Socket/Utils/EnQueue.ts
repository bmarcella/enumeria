/* eslint-disable @typescript-eslint/no-explicit-any */
import { DQueues } from '@Damba/core/Queues';
import { DambaApi } from '@Damba/v2/service/DambaService';

export async function enqueueToolRun(
  api: DambaApi,
  payload: {
    runId: string;
    orgId: string;
    toolArtifactId: string;
    input: any;
    correlationId: string;
    permissionsGranted: string[];
    scopeType?: string;
    scopeId?: string;
  },
) {
  await api.enqueue(DQueues.TOOlS_RUN, payload, {
    attempts: 2,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 500,
    removeOnFail: 1000,
  });
}
