/* eslint-disable @typescript-eslint/no-explicit-any */
export type AgentRunEventBase = {
  tenantId: string;
  correlationId?: string;
  runId?: string;
  assignmentId?: string;
  agentDefinitionId?: string;
  ts: string; // ISO
};

export type AgentRunStartedEvent = AgentRunEventBase & {
  type: 'started';
  request?: string;
};

export type AgentRunProgressEvent = AgentRunEventBase & {
  type: 'progress';
  progress: any; // ex: { step, pct, message }
};

export type AgentRunCompletedEvent = AgentRunEventBase & {
  type: 'completed';
  outputSummary?: string;
};

export type AgentRunFailedEvent = AgentRunEventBase & {
  type: 'failed';
  error: string;
};

export type AgentRunEvent =
  | AgentRunStartedEvent
  | AgentRunProgressEvent
  | AgentRunCompletedEvent
  | AgentRunFailedEvent;
