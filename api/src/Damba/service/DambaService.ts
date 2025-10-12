import { Request, Response, NextFunction } from 'express';

/** Adjust this to your repository expectations. If you use TypeORM, use EntityTarget from typeorm. */
export type EntityCtor<T = any> = abstract new (...args: any[]) => T
export type EntityTarget<T = any> = EntityCtor<T>;

export enum Http { GET = 'GET', POST = 'POST', PUT = 'PUT', DELETE = 'DELETE', PATCH = "PATCH" }

export const toHttpEnum = (value: string): Http | undefined => {
    return Object.values(Http).includes(value as Http)
        ? (value as Http)
        : undefined
}

export type ServiceFn<REQ = Request, RES = Response, NEXT = NextFunction> =
    (req: REQ, res: RES, next?: NEXT) => any | Promise<any>;

export interface IServiceDefinition<REQ = Request, RES = Response, NEXT = NextFunction> {
    middleware?: (req: REQ, res: RES, next: NEXT) => any;
    method?: Http,
    behavior: ServiceFn<REQ, RES, NEXT>;
    extras?: Record<string, (...args: any[]) => any>;
}

/** A key is a "route" if it is exactly "/" OR contains a "/" */
export type RouteKey = '/' | `${string}/${string}`;

/** Map:
 *  - Route keys → route object OR direct handler
 *  - Non-route keys → arbitrary helper functions
 */
export type IServicesMap<REQ = Request, RES = Response, NEXT = NextFunction> = {
    [K in RouteKey]?: IServiceDefinition<REQ, RES, NEXT>;
}



export interface IServiceProvider<REQ, RES, NEXT> {
    [path: string]: IServiceComplete<REQ, RES, NEXT>  //  ;
}

export interface IServiceComplete<REQ = Request, RES = Response, NEXT = NextFunction> {
    service: IServicesMap<REQ, RES, NEXT>;
    middleware?: (req: REQ, res: RES, next: NEXT) => any[]
}

export class ServiceRegistry {
    private services: IServiceProvider<Request, Response, NextFunction> = {}
    public static _instance: ServiceRegistry;
    constructor() { }
    static _init() {
        if (!this._instance) {
            this._instance = new ServiceRegistry();
        }
        return this._instance;
    }

    public populate = (path: string, service: any) => {
        this.services[path] = service;
    }

    public get() {
        return this.services;
    }
}


export interface ServiceConfig {
    crud?: {
        delete: boolean,
        post: boolean,
        get: boolean;
        patch: boolean,
        put: boolean,
    }
}


export const createService = <T, REQ = Request, RES = Response, NEXT = NextFunction>
    (name: string,
        entity?: new (...args: any[]) => any,
        config?: ServiceConfig,
        middleware?: (req: REQ, res: RES, next: NEXT) => any[]) => {
    const routes: Record<string, any> = {}
    let service_name: string = name;
    const DAction = <REQ, RES, NEXT>(
        path: string,
        behavior: ServiceFn<REQ, RES, NEXT>,
        middleware?: (req: REQ, res: RES, next: NEXT) => any,
        extras?: Record<string, (...args: any[]) => any>
    ) => {
        routes[path] = { behavior, middleware, extras }
    }

    const buildPath = (method: string, path?: string) =>
        `${method}@${path ? path.replace(/^\/+/, '') : ''}`

    const makeRoute = (method: string) =>
        <REQ = Request, RES = Response, NEXT = NextFunction>(
            path: string,
            behavior: ServiceFn<REQ, RES, NEXT>,
            extras?: Record<string, (...args: any[]) => any>,
            middleware?: (req: REQ, res: RES, next: NEXT) => any,
        ) => DAction(buildPath(method, path), behavior, middleware, extras)
    const DGet = makeRoute('GET')
    const DPost = makeRoute('POST')
    const DDelete = makeRoute('DELETE')
    const DPatch = makeRoute('PATCH')
    const DPut = makeRoute('PUT')
    if (entity) {
        if (config?.crud?.get)
            DGet("/", async (req, res) => {
                const entities = await req.DRepository.DGet(
                    entity, {}, true
                );
                return res.json(entities);
            }, {})
        if (config?.crud?.post)
            DPost("/", async (req, res) => {
                const object = req.body as Partial<T>;
                const entities = await req.DRepository.DSave(
                    entity,
                    object
                );
                return res.json(entities);
            }, {})
        if (config?.crud?.patch)
            DPatch("/:id", async (req, res) => {
                const object = req.body as Partial<T> & {
                    id: any
                };
                if (!req.params.id) res.status(404).send({});
                object.id = req.params.id;
                const entities = await req.DRepository.DSave(
                    entity,
                    object,
                );
                return res.status(200).json(entities);
            }, {})

        if (config?.crud?.patch)
            DPut("/:id", async (req, res) => {
                const object = req.body as T & {
                    id: any
                };
                if (!req.params.id) res.status(404).send({});
                object.id = req.params.id;
                const entities = await req.DRepository.DSave(
                    entity,
                    object,
                );
                return res.status(200).json(entities);
            }, {})
        if (config?.crud?.delete)
            DDelete("/:id", async (req, res) => {
                if (!req.params.id) res.status(404).send({});
                const id = req.params.id;
                const entities = await req.DRepository.DDelete(
                    entity,
                    {
                        where: {
                            id
                        }
                    }
                );
                return res.json(entities);
            }, {})
    }

    return {
        DGet,
        DPost,
        DDelete,
        DPatch,
        DPut,
        done: (): IServiceProvider<REQ, RES, NEXT> => {
            ServiceRegistry._init().populate(service_name, routes);
            return {
                [service_name]: {
                    service: routes,
                    middleware
                }
            }
        },
    }
}



