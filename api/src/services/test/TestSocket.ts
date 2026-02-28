
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
            //  api?.enqueue<Queue>()
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
  }
}

export default createDambaService( { service, events, queues } ) ;




