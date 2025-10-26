
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
export type ExtrasMap = Record<string,  Record<string, (...args: any[]) => any>>

/** Adjust this to your repository expectations. If you use TypeORM, use EntityTarget from typeorm. */
export type EntityCtor<T = any> = abstract new (...args: any[]) => T
export type EntityTarget<T = any> = EntityCtor<T>;

export enum Http { GET = 'GET', POST = 'POST', PUT = 'PUT', DELETE = 'DELETE', PATCH = "PATCH" }

export const toHttpEnum = (value: string): Http | undefined => {
    return Object.values(Http).includes(value as Http)
        ? (value as Http)
        : undefined
}

export type ServiceFn =
    (damba_event: DEvent) => any | Promise<any>;

export interface IServiceDefinition<REQ = Request, RES = Response, NEXT = NextFunction> {
   // middleware?: (req: REQ, res: RES, next: NEXT) => any;
    middleware?: ((req: REQ, res: RES, next: NEXT) => any)[] | [];
    method?: Http,
    behavior: ServiceFn [] | ServiceFn;
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
    middleware?: ((req: REQ, res: RES, next: NEXT) => any[]) | [];
    dbEntity?: new (...args: any[]) => any | any
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
        delete?: boolean,
        post?: boolean,
        get: boolean;
        patch?: boolean,
        put?: boolean,
    }
}

export interface DEvent {
    in: Request;
    out: Response;
    go: NextFunction;
}


export const createBehaviors = <T, REQ = Request, RES = Response, NEXT = NextFunction>
    (name: string,
        entity?: new (...args: any[]) => any,
        config: ServiceConfig = {
            crud: {
                delete: true,
                post: true,
                get: true,
                patch: true,
                put: true,
            }
        },
    _fmiddleware?: ((de: DEvent) => any)[] | []) => {
    const routes: Record<string, any> = {}
    let service_name: string = name;

    const DAction = <REQ, RES, NEXT>(
        path: string,
        behavior: ServiceFn,
        middleware?: ((req: REQ, res: RES, next: NEXT) => any) [] | [],
        extras?: Record<string, (...args: any[]) => any>
    ) => {
        routes[path] = { behavior, middleware, extras }
    }

    const getMiddlewares  = (_middleware?: ((de: DEvent) => any) [] | [] ) : any => {
        return _middleware && _middleware.length > 0
            ? _middleware.map((_mw) => {
                return (req: REQ, res: RES, next: NEXT) => {
                    const de = {
                        in: req,
                        out: res,
                        go: next,
                    } as DEvent;

                    return _mw(de);
                };
                })
            : [];
    
    }

    
    const getBehaviors  = (_middleware?: ((de: DEvent) => any) [] | []) : any => {
        return _middleware && _middleware.length > 0
            ?  _middleware.map((_mw) => {
                return (req: REQ, res: RES, next: NEXT) => {
                    const de = {
                    in: req,
                    out: res,
                    go: next,
                    } as DEvent;
                    return _mw(de);
                };
                })
            : [];
    
    }

      const getBehavior  = (_middleware: (de: DEvent) => any) : any => {
            return (req: REQ, res: RES, next: NEXT) => {
                    const de = {
                    in: req,
                    out: res,
                    go: next,
                    } as DEvent;
                    return _middleware(de);
                };
    
    }

    const buildPath = (method: string, path?: string) =>
        `${method}@${path ? path : ''}`
    /**
     * Creates a typed route builder for a specific HTTP method.
     *
     * @param method - The HTTP method to associate with this route (e.g., 'GET', 'POST', 'PUT', 'DELETE').
     *
     * @returns A generic function that defines a route with the following parameters:
     *
     * @template REQ - Express Request type (defaults to `Request`).
     * @template RES - Express Response type (defaults to `Response`).
     * @template NEXT - Express NextFunction type (defaults to `NextFunction`).
     *
     * @param path - The route path (e.g., '/users', '/auth/login').
     *
     * @param behavior - The main handler function for this route.
     *                   It should match the signature `(req: REQ, res: RES, next?: NEXT) => any | Promise<any>`.
     *
     * @param extras - (Optional) An object containing helper functions or metadata related to this route.
     *                 Each key is a string, and each value is a function that can take any arguments.
     *                 Example: `{ toDto: (user) => ({ id: user.id, name: user.name }) }`
     *
     * @param _middleware - (Optional) An array of middleware functions, each receiving a `DEvent` object.
     *                      Each middleware has the signature `(de: DEvent) => any`.
     *                      The `DEvent` object contains:
     *                        - `in`: Express `Request`
     *                        - `out`: Express `Response`
     *                        - `go`: Express `NextFunction`
     *
     * @returns A new DAction instance built from the given method, path, behavior, middleware, and extras.
     */
    const makeRoute = (method: string) => {
        return (
        path: string,
        _behavior: ServiceFn [] | ServiceFn,
         extras?: Record<string, (...args: any[]) => any>,
        _middleware?: ((de: DEvent) => any) [],
        ) => {
        const middleware = getMiddlewares(_middleware);
        const behavior =Array.isArray(_behavior) ? getBehaviors(_behavior) :  getBehavior(_behavior);
        return DAction(buildPath(method, path), behavior, middleware, extras);
        };
    };

    const DGet = makeRoute('GET')
    const DPost = makeRoute('POST')
    const DDelete = makeRoute('DELETE')
    const DPatch = makeRoute('PATCH')
    const DPut = makeRoute('PUT')

    if (entity) {
        if (config?.crud?.get)
            DGet("", async (e:DEvent) => {
                const req = e.in as Request;
                const res = e.out as Response;
                const entities = await req.DRepository.DGet(
                    entity, {}, true
                );
                return res.json(entities);
            }, {})
        if (config?.crud?.post)
            DPost("", async (e:DEvent) =>                {
                const req = e.in as Request;
                const res = e.out as Response;
                const object = req.body as Partial<T>;
                const entities = await req.DRepository.DSave(
                    entity,
                    object
                );
                return res.json(entities);
            }, {})
        if (config?.crud?.patch)
            DPatch("/:id", async (e:DEvent) => {
                const req = e.in as Request;
                const res = e.out as Response;
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
            DPut("/:id", async (e:DEvent) => {
                const req = e.in as Request;
                const res = e.out as Response; 
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
            DDelete("/:id", async (e:DEvent) => {
                const req = e.in as Request;
                const res = e.out as Response;
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
            const middleware = getMiddlewares(_fmiddleware);
            return (middleware && middleware.length > 0) ? {
                [service_name]: {
                    service: routes,
                    middleware,
                    dbEntity: entity
                }
             } :
                {
                    [service_name]: {
                        service: routes,
                        dbEntity: entity
                    }
                };
        },
    }
}



