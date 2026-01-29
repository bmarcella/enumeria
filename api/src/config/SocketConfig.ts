import { Socket, Server as SocketIO } from "socket.io";
import type { Server as HttpServer } from "http";
import { SocketConfig } from "@Damba/v2/config/IAppConfig";

export const socketConfig: SocketConfig  = {
    onDisconnect : (e) =>{

    },
    onConnectError : (e) =>{

    },
    onConnect : (socket: Socket)=>{
         
    },
    launch: (server: HttpServer) : SocketIO => {

           const io = new SocketIO(server, {
                cors: { origin: "*" },
                transports: ["polling", "websocket"],
           });

          return io;
    }
   
  }

