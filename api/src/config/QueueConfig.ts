export const QueueConfig = {
  basic: {
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
    attempts: 5,
    backoff: { type: 'exponential', delay: 2000 },
  },
  trace: {
    tenant: 'x-tenant',
    correlation: 'x-correlation-id',
  },
};
