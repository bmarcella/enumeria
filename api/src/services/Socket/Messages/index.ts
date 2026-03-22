/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DQueues } from '@Damba/core/Queues';
import { EventBehavior, DambaApi } from '@Damba/v2/service/DambaService';
import { EventHandler } from '@Damba/v2/service/IServiceDamba';
import { Socket } from 'socket.io';


export const create_project_event: EventBehavior = (api?: DambaApi): EventHandler => {
  return async (socket: Socket, data: any, _callback) => {
    const payload  = {
      prompt: data.payload.prompt,
      newRequestId: data.newRequestId,
      prevRequestId: data.prevRequestId,
      tenantId: data.payload.tenantId,
      correlationId: data.payload.correlationId,
      enqueuedAt: new Date().toISOString(),
    };
    console.log('Received job data:', payload);
    const job: any = await api?.enqueue(DQueues.CREATE_PROJECT, payload);
    return {
      jobId: job?.id,
    };
  };
};
