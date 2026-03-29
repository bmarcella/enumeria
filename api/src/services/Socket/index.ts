/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import RedisConnection, { createRedisConnection } from '@App/config/redis';
import { DQueues, pipelineQueue } from '@Damba/core/Queues';
import { SocketAction, EntityType } from '@Damba/core/Socket';
import { PipelineStep, PIPELINE_ORDER } from '@Damba/core/CreateProjectStep';
import {
  createDambaService,
  DambaApi,
  DambaService,
  EBChain,
  QueueBehavior,
} from '@Damba/v2/service/DambaService';
import { Queue, QueueEvents } from 'bullmq';
import { emitToRequest, emitAll } from '@Damba/v2/IO/RegistrySocket';
import { create_project_event } from './Messages';
import {
  pipeline_step1_event,
  pipeline_step2_event,
  pipeline_step3_event,
  pipeline_step4_event,
  pipeline_step5_event,
  pipeline_step6_event,
  pipeline_step7_event,
  pipeline_step8_event,
  pipeline_step9_event,
} from './Messages/pipeline';
import { auth } from '@App/damba.import';

const service = {
  name: '/socket',
  redis: RedisConnection,
  Queue,
  QueueEvents,
  queuePrefix: false,
  redisConnectionFactory: createRedisConnection,
} as DambaService;

// ─── Socket events ──────────────────────────────────────────────────────────
const pipelineStepEvents: Record<string, any> = {
  [SocketAction.pipeline(PipelineStep.PROJECT_AND_APPS)]: {
    message: pipeline_step1_event,
    middleware: [auth?.socketCheck(['user'])],
  },
  [SocketAction.pipeline(PipelineStep.ENTITIES)]: {
    message: pipeline_step2_event,
    middleware: [auth?.socketCheck(['user'])],
  },
  [SocketAction.pipeline(PipelineStep.MODULES)]: {
    message: pipeline_step3_event,
    middleware: [auth?.socketCheck(['user'])],
  },
  [SocketAction.pipeline(PipelineStep.SERVICES)]: {
    message: pipeline_step4_event,
    middleware: [auth?.socketCheck(['user'])],
  },
  [SocketAction.pipeline(PipelineStep.VALIDATORS)]: {
    message: pipeline_step5_event,
    middleware: [auth?.socketCheck(['user'])],
  },
  [SocketAction.pipeline(PipelineStep.MIDDLEWARES_POLICIES)]: {
    message: pipeline_step6_event,
    middleware: [auth?.socketCheck(['user'])],
  },
  [SocketAction.pipeline(PipelineStep.BEHAVIORS_EXTRAS)]: {
    message: pipeline_step7_event,
    middleware: [auth?.socketCheck(['user'])],
  },
  [SocketAction.pipeline(PipelineStep.APP_FILES)]: {
    message: pipeline_step8_event,
    middleware: [auth?.socketCheck(['user'])],
  },
  [SocketAction.pipeline(PipelineStep.DAMBA_COMMON)]: {
    message: pipeline_step9_event,
    middleware: [auth?.socketCheck(['user'])],
  },
};

const events: EBChain = {
  // Legacy monolithic create project (kept for backwards compatibility)
  [SocketAction.create(EntityType.PROJECT)]: {
    message: create_project_event,
    middleware: [auth?.socketCheck(['user'])],
  },
  // Pipeline step events
  ...pipelineStepEvents,
};

/** Creates standard queue event handlers for a pipeline step */
const makePipelineQueueBehavior = (step: PipelineStep) => ({
  options: {
    attempts: 2,
    backoff: { type: 'exponential' as const, delay: 2000 },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
  events: {
    completed: (_api: DambaApi, ctx?: any) => {
      const payload = ctx?.returnvalue ?? {};
      console.log('Job completed with result:', ctx);
      const eventName = `complete:pipeline:${step}:${ctx.jobId}`;
      const requestId = String(payload.requestId ?? '').trim();
      if (requestId) emitToRequest(requestId, eventName, payload);
    },
    failed: (_api: DambaApi, ctx?: any) => {
      const payload = ctx ?? {};
      console.log('Job failed with result:', ctx);
      const eventName = `failed:pipeline:${step}:${ctx.jobId}`;
      const requestId = String(payload.requestId ?? '').trim();
      if (requestId) emitToRequest(requestId, eventName, payload);
    },
    progress: (_api: DambaApi, ctx?: any) => {
      const payload = ctx ?? {};
      console.log('Job progress:', ctx);
      const eventName = `progress:pipeline:${step}:${ctx.jobId}`;
      const requestId = String(payload.requestId ?? '').trim();
      if (requestId) emitToRequest(requestId, eventName, payload);
    },
  },
});

// Build queue behaviors for all pipeline steps
const pipelineQueueBehaviors: Record<string, any> = {};
for (const step of PIPELINE_ORDER) {
  pipelineQueueBehaviors[pipelineQueue(step)] = makePipelineQueueBehavior(step);
}

const queues: QueueBehavior = {
  [DQueues.TOOlS_RUN]: {
    options: {
      attempts: 2,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
    events: {
      completed: (api: DambaApi, ctx?: any) => {
        const payload = ctx?.returnvalue ?? {};
        console.log('Job completed with result:', ctx);
        const eventName = `update:job:tools-run:${ctx.jobId}`;
      },
    },
  },
  // Legacy monolithic create project queue
  [DQueues.CREATE_PROJECT]: {
    options: {
      attempts: 2,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
    events: {
      completed: (api: DambaApi, ctx?: any) => {
        const payload = ctx?.returnvalue ?? {};
        console.log('Job completed with result:', ctx);
        const eventName = `complete:job:create-project:${ctx.jobId}`;
        const requestId = String(payload.newRequestId ?? '').trim();
        if (requestId) emitToRequest(requestId, eventName, payload);
      },
      failed: (api: DambaApi, ctx?: any) => {
        const payload = ctx ?? {};
        console.log('Job failed with result:', ctx);
        const eventName = `failed:job:create-project:${ctx.jobId}`;
        const requestId = String(payload.newRequestId ?? '').trim();
        if (requestId) emitToRequest(requestId, eventName, payload);
      },
      progress: (api: DambaApi, ctx?: any) => {
        const payload = ctx ?? {};
        console.log('Job progress:', ctx);
        const eventName = `progress:job:create-project:${ctx.jobId}`;
        const requestId = String(payload.requestId ?? '').trim();
        if (requestId) emitToRequest(requestId, eventName, payload);
      },
    },
  },
  // Pipeline step queues
  ...pipelineQueueBehaviors,
  [DQueues.AGENT_RUN]: {
    options: {
      attempts: 2,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
    events: {
      completed: (api?: DambaApi, ctx?: { jobId: string; returnvalue?: any }) => {
        const payload = ctx?.returnvalue ?? {};
        const eventName = SocketAction.update(EntityType.SERVICE);
        const requestId = String(payload?.request_id ?? '').trim();
        if (requestId) emitToRequest(requestId, eventName, payload);
        else emitAll(eventName, payload);
      },
    },
  },
};

export default createDambaService({ service, events, queues });
