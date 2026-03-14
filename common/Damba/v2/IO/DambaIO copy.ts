import { SocketConfig } from "../config/IAppConfig";
import { RegistryContext } from "../Registry/RegistryContext";
import { EventHandler } from "../service/IServiceDamba";
import { runWithQueueContext } from "../service/QueuesBull";
import { SocketRegistry } from "./RegistrySocket";

export class DambaIOApp<IO = any> {
  sockets: any[] = [];
  clients = new Map<string, Set<any>>(); // requestId -> sockets

  constructor(private io: IO | any, private socketConfig: SocketConfig) {}

  public createRequestId(correlationId: string, userId: string) {
    return `${correlationId}-${userId}`; // or any unique identifier per request
  }

  public getPartFromRequestId(requestId: string, index: number): string | null {
    const parts = requestId.split("-");
    if (parts.length < 2) return null;
    return parts[index] || null;
  }

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
        const { tenantId, correlationId, userId } = socket.handshake.auth || {};

        console.log("Socket connected with context:", {
          tenantId,
          correlationId,
        });
        const requestId = this.createRequestId(
          correlationId ?? "no-correlation",
          userId ?? "no-user"
        );
        // Store it on socket
        socket.data.tenantId = tenantId ?? "default";
        socket.data.correlationId = correlationId;
        socket.data.requestId = requestId;

        SocketRegistry.addSocket(socket);

        socket.data.userId = userId;
        SocketRegistry.bindRequest(socket, userId);
        console.info("Socket -> " + socket.id + " : New Client Connect ");
        socket.on("disconnect", (reason: string) => {
          try {
            this.socketConfig.onDisconnect?.(socket, reason);
          } finally {
            SocketRegistry.removeSocket(socket);
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
            socket.on(event, async (payload: any, _callback: any) => {
              const tenant = socket.data.tenantId ?? "default";
              const prevRequestId = socket.data.requestId;
              const userId = socket.data.userId;
              const correlationId =
                payload?.correlationId ??
                socket.data.correlationId ??
                socket.handshake.auth?.correlationId ??
                undefined;
              const newRequestId = this.createRequestId(
                correlationId ?? "no-correlation",
                userId ?? "no-user"
              );
              socket.data.tenantId = tenant;
              socket.data.correlationId = correlationId;
              socket.data.requestId = newRequestId;

              if (prevRequestId && prevRequestId !== correlationId) {
                SocketRegistry.unbindRequest(socket, newRequestId);
              }
              if (newRequestId) {
                SocketRegistry.bindRequest(socket, newRequestId);
              }

              try {
                return await runWithQueueContext(
                  { keyPrefix: tenant, correlationId },
                  async () => {
                    // optional: RegistryContext.run only if you store *non-queue* request-scoped things
                    return await RegistryContext.run({}, async () => {
                      const data = await handler(
                        socket,
                        payload,
                        _callback,
                        this.io
                      );

                      if (_callback && data !== undefined) {
                        _callback({
                          ok: true,
                          correlationId,
                          tenant_id: tenant,
                          payload,
                          data,
                          event,
                        });
                      }
                    });
                  }
                );
              } catch (e: any) {
                _callback?.({
                  ok: false,
                  correlationId,
                  tenant_id: tenant,
                  payload,
                  event,
                  error: e?.message ?? "server_error",
                });
              }
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
