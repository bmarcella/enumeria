export type QueueEventsHandlers<API = any> = Partial<{
  prefix?: string; // ex: "project:1234:run"
  autorun?: boolean; // si true, la queue s'exécutera automatiquement à l'ajout d'un job
  streams?: any;
  completed: <T = any, R = any>(
    api: API,
    ctx: { jobId: string; returnvalue?: T }
  ) => R | any;
  failed?: <R = any>(
    api: API,
    ctx: { jobId: string; failedReason?: string }
  ) => R | any;
  progress?: <T = any>(api: API, ctx: { jobId: string; data?: any }) => T | any;
}>;

export type QueueBehaviorContent<Q = any, API = any> = {
  defaultJobName?: string; // ex: "run", "build"...
  options?: any; // bullmq job options
  events: QueueEventsHandlers<API>;
  // optionnel: transformer payload -> job data
  mapData?: (payload: Q, api: API) => any;
};
