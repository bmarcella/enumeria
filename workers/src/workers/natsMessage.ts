/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subjects } from '@Damba/v2/nats/subjects';
import { nats } from '../index';

function now() {
  return new Date().toISOString();
}

export async function publishRunProgress(args: {
  tenantId: string;
  correlationId?: string;
  runId?: string;
  progress: any;
}) {
  nats.publish(Subjects.runProgress(args.tenantId), {
    type: 'progress',
    tenantId: args.tenantId,
    correlationId: args.correlationId,
    runId: args.runId,
    progress: args.progress,
    ts: now(),
  });
}
