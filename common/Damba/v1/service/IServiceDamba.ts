/* eslint-disable @typescript-eslint/no-explicit-any */
import { RouteKey } from "./DambaHelper";
import { DEvent } from "./DEvent";

export interface IDActionConfig {
  timeout?: number,
  description?: string
}

export type ExtrasMap = Record<string, Record<string, (...args: any[]) => any>>
// /** Adjust this to your repository expectations. If you use TypeORM, use EntityTarget from typeorm. */
export type EntityCtor<T = any> = abstract new (...args: any[]) => T
export type EntityTarget<T = any> = EntityCtor<T>;

export enum Http { GET = 'GET', POST = 'POST', PUT = 'PUT', DELETE = 'DELETE', PATCH = "PATCH" }

export type ServiceFn<REQ, RES, NEXT> = (damba_event: DEvent<REQ, RES, NEXT>) => any | Promise<any>;
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IServiceDefinition<REQ, RES, NEXT> {
    // middleware?: (req: REQ, res: RES, next: NEXT) => any;
    middleware?: ((req: REQ, res: RES, next: NEXT) => any)[] | [];
    method?: Http,
    behavior: ServiceFn<REQ, RES, NEXT>[] | ServiceFn<REQ, RES, NEXT>;
    extras?: Record<string, (...args: any[]) => any>;
}

export type IServicesMap<REQ, RES, NEXT> = {
    [K in RouteKey]?: IServiceDefinition<REQ, RES, NEXT>;
}

export interface IServiceProvider<REQ, RES, NEXT> {
    [path: string]: IServiceComplete<REQ, RES, NEXT>  //  ;
}

export interface IServiceComplete<REQ, RES, NEXT> {
    service: IServicesMap<REQ, RES, NEXT>;
    middleware?: ((req: REQ, res: RES, next: NEXT) => any[]) | [];
    dbEntity?: new (...args: any[]) => any | any
}
