/* eslint-disable @typescript-eslint/no-unused-vars */
import { DQueues } from '@Damba/core/Queues';
import { EventBehavior, DambaApi } from '@Damba/v2/service/DambaService';
import { EventHandler } from '@Damba/v2/service/IServiceDamba';
import { Socket } from 'dgram';

export const create_project_event: EventBehavior = (api?: DambaApi): EventHandler => {
  return async (socket: Socket, payload) => {
    const job = await api?.enqueue(DQueues.CREATE_PROJECT, payload);
    console.log(job);
    console.log(payload);
  };
};
