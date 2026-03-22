export interface IWorkerPromptMeta {
  keyPrefix?: string;
  requestId?: string;
  step?: string;
  pct?: number;
  tenantId?: string;
  correlationId: string;
  enqueuedAt: string;
  shardName?: string;
  enqueueBy: string;
  from: string;
  initial_job_id?: string;
  final_job_id?: string;
  prompt: string;
  message_id?: string;
  conversation_id?: string;
  project_id?: string;
  app_id?: string;
  service_id?: string;
  module_id?: string;
  entity_id?: string;
  stereotype?: any;
  output?: any;
  agentRunId?: string
}

export interface IWorkerMeta {
  keyPrefix?: string;
  requestId?: string;
  step?: string;
  pct?: number;
  tenantId?: string;
  correlationId: string;
  enqueuedAt: string;
  shardName: string;
  enqueueBy: string;
  from: string;
  initial_job_id: string;
  final_job_id?: string;
  initial_prompt?: string;
  message_id?: string;
  conversation_id?: string;
  project_id?: string;
  app_id?: string;
  service_id?: string;
  module_id?: string;
  entity_id?: string;
  stereotype?: any;
  output?: any;
  agentRunId?: string
}
