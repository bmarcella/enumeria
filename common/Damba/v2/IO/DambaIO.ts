// IO/DambaIO.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import crypto from "node:crypto";
import { SocketConfig } from "../config/IAppConfig";
import { RegistryContext } from "../Registry/RegistryContext";
import { runWithQueueContext } from "../service/QueuesBull";
import { SocketRegistry } from "./RegistrySocket";
import { SocketEventHandlerChain } from "../service/IServiceDamba";

export class DambaIOApp<IO = any> {
  sockets: any[] = [];

  constructor(private io: IO | any, private socketConfig: SocketConfig, private oauth2Google: any) {

  }


  private createRequestId(correlationId?: string) {
    const c = encodeURIComponent(correlationId ?? "no-correlation");
    const uuid = crypto.randomUUID();
    return `${c}|${uuid}`;
  }

  public init<S = any, IO = any>(events: SocketEventHandlerChain) {

  
    this.io.on(
      "connection",
      async (
        socket: S & {
          on: Function;
          id?: string;
          handshake: any;
          data: any;
          emit: (event: string, payload: any) => void;
        }
      ) => {
        const { tenantId, correlationId, userId , token} = socket.handshake.auth || {};

        // Store base identity on socket (userId is kept separately)
        socket.data.tenantId = tenantId ?? "default";
        socket.data.userId = userId ?? undefined;
        socket.data.correlationId = correlationId ?? undefined;
        socket.data.token = token ?? undefined;

        // const user = await auth.verifyToken(token);
        // if (!user) {
        //   socket.disconnect();
        //   return;
        // }

        // Register socket globally
        SocketRegistry.addSocket(socket);

        // Bind user if provided (optional but useful for emitToUser)
        if (socket.data.userId) {
           SocketRegistry.bindUser(socket, socket.data.userId);
        }

        // Create initial requestId (correlation-based, unique)
        const initialRequestId = this.createRequestId(
          socket.data.correlationId
        );
        socket.data.requestId = initialRequestId;
        SocketRegistry.bindRequest(socket, initialRequestId);

        this.socketConfig.onConnect(socket);
        console.info(`Socket -> ${socket.id} : New Client Connect`);

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
          for (const [event, sehc ] of Object.entries(events)) {
  
            const handler = sehc.handler;
            const middleware = sehc.middleware ?? [];
 
            console.info(`Socket -> ${socket.id} : Listening for -> ${event}`);

            socket.on(event, async (payload: any, _callback: any) => {
              const tenant = socket.data.tenantId ?? "default";

              const correlationIdResolved =
                payload?.correlationId ??
                socket.data.correlationId ??
                socket.handshake.auth?.correlationId ??
                undefined;

              // Update socket metadata
              socket.data.correlationId = correlationIdResolved;

              // Rotate requestId per message (correlation-based + unique)
              const prevRequestId = socket.data.requestId;
              const newRequestId = this.createRequestId(correlationIdResolved);

              socket.data.requestId = newRequestId;

              payload = { payload , newRequestId, prevRequestId };

              // Update request bindings
              if (prevRequestId && prevRequestId !== newRequestId) {
                SocketRegistry.unbindRequest(socket, prevRequestId);
              }
              SocketRegistry.bindRequest(socket, newRequestId);

              try {
                return await runWithQueueContext(
                  { keyPrefix: tenant, correlationId: correlationIdResolved },
                  async () => {
                    // Keep RegistryContext only if you store per-event scoped registries
                    return await RegistryContext.run({}, async () => {
                      let data : any[] | any ;
                      if ( !Array.isArray(handler)) {
                         data = await handler(
                            socket,
                            payload,
                            _callback,
                            this.io
                          );
                       } else {
                        for (const h of handler) {
                         const  inline_data = await h(
                            socket,
                            payload,
                            _callback,
                            this.io
                          );
                          if(!data) data = [];
                          data.push(inline_data); 
                        }
                      }
                      if (_callback && data !== undefined) {
                        _callback({
                          ok: true,
                          tenant_id: tenant,
                          correlationId: correlationIdResolved,
                          requestId: newRequestId,
                          userId: socket.data.userId, // exposed separately if you want it
                          payload,
                          data,
                          event,
                        });
                      }
                      return data;
                    });
                  }
                );
              } catch (e: any) {
                _callback?.({
                  ok: false,
                  tenant_id: tenant,
                  correlationId: correlationIdResolved,
                  requestId: newRequestId,
                  userId: socket.data.userId,
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
    socketConfig: SocketConfig,
    oauth2Google: any
  ): DambaIOApp<IO> {
    if (!this._dio) {
      this._dio = new DambaIOApp<IO>(socket, socketConfig, oauth2Google);
    }
    return this._dio as DambaIOApp<IO>;
  }
}
