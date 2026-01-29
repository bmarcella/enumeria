import { SocketConfig } from "../config/IAppConfig";
import { EventHandler } from "../service/IServiceDamba";

export class DambaIOApp<IO = any> {
    sockets : any [] = []

    constructor (private io: IO | any, private socketConfig : SocketConfig ) {}

    public init<S= any> (events: EventHandler<S>) {

         this.io.on("connection", (socket: S & { on: Function; id?: string } ) => {
           
            this.socketConfig.onConnect(socket);

            socket.on("disconnect", (reason: string) => {
               try {
                  this.socketConfig.onDisconnect?.(socket, reason);
               } finally {
                  // cleanup
                  this.sockets = this.sockets.filter(s => s !== socket);
               }
            });

            socket.on("error", (err: any) => {
                this.socketConfig.onError?.(socket, err);
            });

            if (events) {
               for (const [event, handler] of Object.entries(events)) {
                  socket.on(event, (payload: any) => handler(socket, payload));
               }
            }

            socket.on("message", (data: any) => {
               this.socketConfig.onMessage?.(socket, data);
            });

            this.sockets.push(socket)
         });

          this.io.engine?.on("connection_error", (err: any) => {
            this.socketConfig.onConnectError?.(err);
          });
    }


}


export class DambaIO {
  private  static _dio: DambaIOApp; 
  public static init<IO> (socket: IO, socketConfig: SocketConfig) : DambaIOApp<IO> {
     if (!this._dio){
         this._dio = new DambaIOApp<IO>(socket, socketConfig)
     }
     return this._dio;
  }
}