import { SocketConfig } from "../config/IAppConfig";
import { RegistryContext } from "../Registry/RegistryContext";
import { EventHandler } from "../service/IServiceDamba";
import { runWithQueueContext } from "../service/QueuesBull";

type Client = { socket: any; requestId: string };
const clients = new Map<string, Set<any>>(); // requestId -> sockets

export class DambaIOApp<IO = any> {
  sockets: any[] = [];
  clients = new Map<string, Set<any>>(); // requestId -> sockets

  constructor(private io: IO | any, private socketConfig: SocketConfig) {}

  public init<S = any>(events: EventHandler<S>) {
    this.io.on(
      "connection",
      (
        socket: S & {
          on: Function;
          id?: string;
          request_id: string;
          handshake: any;
          data: any;
        }
      ) => {
        const { tenantId, correlationId } = socket.handshake.auth || {};

        console.log("Socket connected with context:", {
          tenantId,
          correlationId,
        });

        // Store it on socket
        socket.data.tenantId = tenantId ?? "default";
        socket.data.correlationId = correlationId;
        socket.data.requestId = correlationId; // for simplicity, use correlationId as requestId
        this.socketConfig.onConnect(socket);
        console.info("Socket -> " + socket.id + " : New Client Connect ");
        socket.on("disconnect", (reason: string) => {
          try {
            this.socketConfig.onDisconnect?.(socket, reason);
          } finally {
            // cleanup
            this.sockets = this.sockets.filter((s) => s !== socket);
          }
        });

        socket.on("error", (err: any) => {
          this.socketConfig.onError?.(socket, err);
        });

        if (events) {
          for (const [event, handler] of Object.entries(events)) {
            console.info(
              "Socket -> " +
                socket.id +
                " : Now has listen for message -> " +
                event
            );
            socket.on(event, (payload: any, _callback: any) => {
              const tenant = socket.data.tenantId ?? "default";
              const correlationId =
                payload.correlationId ?? socket.data.correlationId;
              runWithQueueContext({ keyPrefix: tenant, correlationId }, () =>
                RegistryContext.run(
                  { queue: { keyPrefix: tenant, correlationId } },
                  () => handler(socket, payload, _callback, this.io)
                )
              );
            });
          }
        }

        socket.on("message", (data: any) => {
          this.socketConfig.onMessage?.(socket, data);
        });

        this.sockets.push(socket);
      }
    );

    this.io.engine?.on("connection_error", (err: any) => {
      this.socketConfig.onConnectError?.(err);
    });
  }
}

export class DambaIO {
  private static _dio: DambaIOApp;
  public static init<IO>(
    socket: IO,
    socketConfig: SocketConfig
  ): DambaIOApp<IO> {
    if (!this._dio) {
      this._dio = new DambaIOApp<IO>(socket, socketConfig);
    }
    return this._dio;
  }
}
