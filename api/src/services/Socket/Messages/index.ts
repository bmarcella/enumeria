/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DQueues } from '@Damba/core/Queues';
import { EventBehavior, DambaApi } from '@Damba/v2/service/DambaService';
import { EventHandler } from '@Damba/v2/service/IServiceDamba';
import { User } from '@Database/entities/User';
import { Socket } from 'socket.io';

export const create_project_event: EventBehavior = (api?: DambaApi): EventHandler => {
  return async (socket: Socket, data: any, _callback) => {
    const user = socket.data.user as User;
    const payload = {
      userId: user.id,
      prompt: data.payload.prompt,
      newRequestId: data.newRequestId,
      prevRequestId: data.prevRequestId,
      tenantId: user.currentSetting?.orgId,
      correlationId: data.payload.correlationId,
      enqueuedAt: new Date().toISOString(),
    };
    const job: any = await api?.enqueue(DQueues.CREATE_PROJECT, payload);
    return {
      jobId: job?.id,
    };
  };
};
