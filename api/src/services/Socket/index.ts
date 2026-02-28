
import { connection } from "@App/config/redis";
import { DQueues } from "@Damba/core/Queues";
import { SocketAction, EntityType } from "@Damba/core/Socket";
import {  createDambaService, DambaApi, DambaService, EBChain, EventBehavior, QueueBehavior } from "@Damba/v2/service/DambaService";
import { EventHandler } from "@Damba/v2/service/IServiceDamba";
import { Socket } from "socket.io";
import { Queue, QueueEvents } from 'bullmq' ;

const service = {
    name : "/socket",
    redis: connection,
    Queue,
    QueueEvents
} as DambaService;

const e: EventBehavior = (api?: DambaApi) : EventHandler =>{
        return (socket: Socket, payload) => {
             
             console.log(payload);
        }
}

const events : EBChain = {
  [SocketAction.create(EntityType.PROJECT)] : e
}

const queues : QueueBehavior = {
  [DQueues.CREATE_PROJECT] : {
    options: {},
    events: {
      completed:  (api: DambaApi) => {
        throw new Error("Function not implemented.");
      }
    }
  },

  [DQueues.RUN_AGENT]: {
    options: {
      // BullMQ options example (tweak for your needs)
      attempts: 2,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
    events: {
      completed: async (api: DambaApi, ctx: any) => {
        // job.returnvalue can contain summary if your worker returns it
        // emit "agent_run_completed" to org room
        // api.socket.to(`org:${job.data.orgId}`).emit("agent_run_completed", {...})
      },
      failed: async (api: DambaApi, job: any,) => {
        // emit "agent_run_failed"
        // api.socket.to(`org:${job.data.orgId}`).emit("agent_run_failed", {...})
      },
      // If your Damba wrapper supports "progress" event mapping, add it too.
    },
  },
}

export default createDambaService( { service, events, queues } ) ;




