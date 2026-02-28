import { Socket, Server as SocketIO } from "socket.io";
import type { Server as HttpServer } from "http";
import { SocketConfig } from "@Damba/v2/config/IAppConfig";

export const socketConfig: SocketConfig  = {
    onDisconnect : (socket, e) =>{
        console.log("disconnected", socket.id)
    },
    onConnectError : (e) =>{

    },
    onConnect : (socket: Socket)=>{
          console.log("connected", socket.id);
    },
    launch: (server: HttpServer) : SocketIO => {
           const io = new SocketIO(server, {
                cors: { origin: "*" },
                transports: ["polling", "websocket"],
           });
          return io;
    }
   
  }

