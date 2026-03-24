/* eslint-disable @typescript-eslint/no-explicit-any */
import { RouteKey } from "./DambaHelper";
import {  DExtrasHandler } from "./DambaService";
import { DEvent } from "./DEvent";
export type TimeoutType = {
  in?: number;
  out?: number;
};
export interface IDActionConfig {
  timeout?: TimeoutType;
  description?: string;
  validators?: {
    params?: unknown;
    query?: unknown;
    body?: unknown;
    response?: unknown;
  };
}

export type PropType<T, K extends keyof T> = T[K];

export type ExtrasMap = Record<string, Record<string, (...args: any[]) => any>>;

// /** Adjust this to your repository expectations. If you use TypeORM, use EntityTarget from typeorm. */
export type EntityCtor<T = any> = abstract new (...args: any[]) => T;
export type EntityTarget<T = any> = EntityCtor<T>;

export enum Http {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}
export type EventHandler<SK = any, IO = any> = (
  sokect: SK,
  payload?: any,
  _callback?: any,
  io?: IO
) => void | any | Promise<void> | Promise<any>;

export type ServiceFn<REQ, RES, NEXT> = (
  damba_event: DEvent<REQ, RES, NEXT>
) => any | Promise<any>;

export interface IServiceDefinition<REQ, RES, NEXT> {
  middleware?: ((req: REQ, res: RES, next: NEXT) => any)[] | [];
  method?: Http;
  behavior: ServiceFn<REQ, RES, NEXT>[] | ServiceFn<REQ, RES, NEXT>;
  extras?: Record<string, (...args: any[]) => any>;
  config?: IDActionConfig;
}

export type IServicesMap<REQ, RES, NEXT> = {
  [K in RouteKey]?: IServiceDefinition<REQ, RES, NEXT>;
};

export interface IServiceProvider<REQ, RES, NEXT> {
  [path: string]: IServiceComplete<REQ, RES, NEXT>;
}

export type SocketEventHandler<S = any, IO = any> = { handler: EventHandler<S, IO> | EventHandler<S, IO> [], middleware?: any[] }


export type SocketEventHandlerChain<S = any, IO = any> = Record<string, SocketEventHandler<S, IO>>;


export interface IServiceComplete<REQ, RES, NEXT> {
  service: IServicesMap<REQ, RES, NEXT>;
  middleware?: ((req: REQ, res: RES, next: NEXT) => any)[] | [];
  dbEntity?: new (...args: any[]) => any | any;
  events?: SocketEventHandlerChain<any, any>;
  rootExtras?: DExtrasHandler;
}

export type AnyFn = (...args: any[]) => any;
/**
 * @param socket - The socket instance.
 * @param payload - The payload of the event.
 * @param callback - The callback function.
 * @param io - The IO instance.
 * @returns The socket instance or undefined if the socket should be disconnected.
*/
export  type SocketMiddleware<S = any, IO = any> = (socket: S, payload?: any, callback?: any, io?: IO) => Promise<S | undefined> | S | undefined;
