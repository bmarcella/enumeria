// IO/DambaIO.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import crypto from "node:crypto";
import { SocketConfig } from "../config/IAppConfig";
import { RegistryContext } from "../Registry/RegistryContext";
import { runWithQueueContext } from "../service/QueuesBull";
import { SocketRegistry } from "./RegistrySocket";
import { SocketEventHandlerChain } from "../service/IServiceDamba";

const GREEN  = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED    = "\x1b[31m";
const RESET  = "\x1b[0m";
const logOk  = (msg: string) => console.info(`${GREEN}${msg}${RESET}`);
const logWarn = (msg: string) => console.warn(`${YELLOW}${msg}${RESET}`);
const logErr  = (msg: string, err?: unknown) => console.error(`${RED}${msg}${RESET}`, err ?? "");

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
          disconnect: () => void;
        }
      ) => {
        const { tenantId, correlationId, userId , token} = socket.handshake.auth || {};

        // Store base identity on socket (userId is kept separately)
        socket.data.tenantId = tenantId ?? "default";
        socket.data.userId = userId ?? undefined;
        socket.data.correlationId = correlationId ?? undefined;
        socket.data.token = token ?? undefined;
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
        logOk(`Socket -> ${socket.id} : New Client Connected ✓`);

        socket.on("disconnect", (reason: string) => {
          try {
            this.socketConfig.onDisconnect?.(socket, reason);
          } finally {
            SocketRegistry.removeSocket(socket);
            this.sockets = this.sockets.filter((s) => s !== socket);
          }
        });

        socket.on("error", (err: any) => {
          logErr(`Socket -> ${socket.id} : Error`, err);
          this.socketConfig.onError?.(socket, err);
        });
        if (events) {
          for (const [event, sehc ] of Object.entries(events)) {
            // TODO: add  color to log message 
            logOk(`Socket -> ${socket.id} : Listening for -> ${event} ✓`);
            socket.on(event, async (payload: any, _callback: any) => {
              const handler = sehc.handler;
              const middleware = sehc.middleware;
              if (middleware && middleware.length > 0) {
                let socket_data = socket;
                let payload_data = payload;
                let callback_data = _callback;
                if (!payload_data) {
                    payload_data = {};
                }
                if (!_callback) {
                    callback_data = () => {};
                }
                if (!payload_data.token && !socket_data.data.token) {
                     throw new Error("No token provided");
                } else { 
                  logOk(`Socket -> ${socket.id} : Token provided ✓`);
                }
                if (payload_data.token && !socket_data.data.token) {
                   socket_data.data.token = payload_data.token;
                } 
                else if (!payload_data.token && socket_data.data.token) {
                  payload_data.token = socket_data.data.token;
                }

                for (const mw of middleware) {
                  logWarn(`Socket -> ${socket.id} : Applying middleware...`);
                  const new_socket = await mw(socket_data, payload_data, callback_data, this.io);
                  if (new_socket === undefined) {
                    logErr(`Socket -> ${socket.id} : Middleware rejected — disconnecting`);
                    socket.disconnect();
                    return;
                  }
                  socket = new_socket;
                  logOk(`Socket -> ${socket.id} : Middleware applied ✓`);
                }
              }

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
                logErr(`Socket -> ${socket.id} : Handler error on [${event}]`, e);
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
