/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import RedisConnection, { createRedisConnection } from '@App/config/redis';
import { DQueues } from '@Damba/core/Queues';
import { SocketAction, EntityType } from '@Damba/core/Socket';
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

const service = {
  name: '/socket',
  redis: RedisConnection,
  Queue,
  QueueEvents,
  queuePrefix: false,
  // Each QueueEvents instance gets its own dedicated ioredis connection.
  // Without this, all 128+ shard QueueEvents share one connection → ECONNABORTED.
  redisConnectionFactory: createRedisConnection,
} as DambaService;

const events: EBChain = {
  [SocketAction.create(EntityType.PROJECT)]: {
    message: create_project_event,
    middleware: [],
  },
};

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
        const eventName = `update:job:tools-run:${ctx.jobId}`; // example (must match client listener)
      },
    },
  },
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
        const eventName = `update:job:create-project:${ctx.jobId}`; // example (must match client listener)
        const requestId = String(payload.newRequestId ?? '').trim();
        console.log(requestId);
        if (requestId) emitToRequest(requestId, eventName, payload);
      },
    },
  },
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
