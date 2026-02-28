

export type QueueEventsHandlers<API> = Partial<{
  completed: <T = any, R=any>(api: API, ctx: { jobId: string; returnvalue?: T }) => R;
  failed?: <R = any> (api: API, ctx: { jobId: string; failedReason?: string }) => R;
  progress?: <T = any>(api: API, ctx: { jobId: string; data?: any }) => T;
}>;

export type QueueBehaviorContent<Q = any, API = any> = {
  queueName?: string;          // optionnel, sinon on prend `${simple_service_name}:${name}`
  defaultJobName?: string;     // ex: "run", "build"...
  options?: any;       // bullmq job options
  events: QueueEventsHandlers<API>;
  // optionnel: transformer payload -> job data
  mapData?: (payload: Q, api: API) => any;
};
