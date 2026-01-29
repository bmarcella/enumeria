
import {  createDambaService, DambaApi, DambaService, EventBehaviorChainLooper, EventBehaviorChainLooperContent } from "@Damba/v2/service/DambaService";
import { EventHandler } from "@Damba/v2/service/IServiceDamba";
import { Socket } from "socket.io";

const service = {
    name : "/socket",
} as DambaService;

const e: EventBehaviorChainLooperContent = (api?: DambaApi) : EventHandler =>{
        return (socket: Socket, payload) =>{
             
        }
}

const events : EventBehaviorChainLooper = {
  "hello" : e
}

export default createDambaService( { service, events } ) ;




