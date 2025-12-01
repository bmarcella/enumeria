
/* eslint-disable @typescript-eslint/no-unused-vars */


/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { defaultDMiddlewares } from './GenericMiddalware';
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
    id_name: string,
    crud?: {
        delete?: {
            active : boolean,
            middlewares:  ((de: DEvent) => any)[] 
        },
        post?: {
            active : boolean,
            middlewares:  ((de: DEvent) => any)[] 
        },
        get: {
            active : boolean,
            middlewares:  ((de: DEvent) => any)[] 
        };
        patch?: {
            active : boolean,
            middlewares:  ((de: DEvent) => any)[] 
        },
        put?: {
            active : boolean,
            middlewares:  ((de: DEvent) => any)[] 
        },
    }
}

export interface DEvent {
    in: Request;
    out: Response;
    go: NextFunction;
}
export const DefaultDCrudValues = {
                delete: {
                    active: true,
                    middlewares: []
                },
                post: {
                    active: true,
                    middlewares: []
                },
                get: {
                    active: true,
                    middlewares: [],
                },
                patch: {
                    active: true,
                    middlewares: []
                },
                put: {
                    active: true,
                    middlewares: []
                },
}

export function firstCharToUppercase(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const createSimpleName = (name: string)=>{
  const hasSlash = name.includes('/');
  if (!hasSlash) return name
  const words = name.split('/');
  const nWords =[]
  let i = 0;
  for(let j = 0; j < words.length ; j++){ 
    const w = words[j];
    if(i==0 && w =="" || w==undefined){
       continue;
    }
    if(i==0 && w !="" || w!=undefined) {
        nWords.push(w);
        continue;
    }
    nWords.push(firstCharToUppercase(w));
  }
  return nWords.join("");
}


export const createBehaviors = <T, REQ = Request, RES = Response, NEXT = NextFunction>
    (name: string,
        entity?: new (...args: any[]) => any,
        config: ServiceConfig = {
            id_name: 'id',
            crud: DefaultDCrudValues
        },
    _fmiddleware?: ((de: DEvent) => any)[] ) => {
    const routes: Record<string, any> = {};
    name = name.trim();
    let service_name: string = name;
    let dEvent: DEvent | null = null;
    let DExtras: Record<string, (...args: any[]) => any> = {};
    
    const simple_service_name = createSimpleName(service_name);

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
                    setDEvent(de);
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
                    setDEvent(de);
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
         _path: string,
        _behavior: ServiceFn [] | ServiceFn,
         _extras?: Record<string, (...args: any[]) => any>,
        _middleware?: ((de: DEvent) => any) [],
        _timeout?: 30
        ) => {
        const middleware = getMiddlewares(_middleware);
        const behavior =Array.isArray(_behavior) ? getBehaviors(_behavior) :  getBehavior(_behavior);
        DExtras = {
            ...DExtras,
            ..._extras
        }
        return DAction(buildPath(method, _path), behavior, middleware, _extras);
        };
    };

    const DGet = makeRoute('GET')
    const DPost = makeRoute('POST')
    const DDelete = makeRoute('DELETE')
    const DPatch = makeRoute('PATCH')
    const DPut = makeRoute('PUT')

    if (entity) {
        if (config?.crud?.get.active)
            DGet("", async (e:DEvent) => {
                const req = e.in as Request;
                const res = e.out as Response;
                const entities = await req.DRepository.DGet(
                    entity, {}, true
                );
                return res.json(entities);
            }, {}, config?.crud?.get.middlewares)
        if (config?.crud?.post?.active)
            DPost("", async (e:DEvent) =>                {
                const req = e.in as Request;
                const res = e.out as Response;
                const object = req.body as Partial<T>;
                const entities = await req.DRepository.DSave(
                    entity,
                    object
                );
                return res.json(entities);
            }, {}, config?.crud?.post?.middlewares)

        if (config?.crud?.patch?.active)
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
            }, {}, config?.crud?.patch?.middlewares)

        if (config?.crud?.patch?.active)
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
            }, {}, config?.crud?.patch?.middlewares)

        if (config?.crud?.delete?.active)
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
            }, {}, config?.crud?.delete?.middlewares)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const DSave = async ( obj: any): Promise<any> => {
          if(!dEvent) return;
          const e = dEvent;
          try {
            if (!entity) throw new Error('Entity class not provided to createBehaviors');
            return await e.in.DRepository.DSave(entity, obj);
          } catch (error) {
            console.error('DSave failed:', error);
            throw error;
          }
    };

    const DFindOne = async ( where: any): Promise<any> => {
         if(!dEvent) return;
          const e = dEvent;
          try {
            if (!entity) throw new Error('Entity class not provided to createBehaviors');
            return await e.in.DRepository.DGet(entity, where, false);
          } catch (error) {
            console.error('DSave failed:', error);
            throw error;
          }
    };

     const DFindAll = async (where: any): Promise<any> => {
          if(!dEvent) return;
          const e = dEvent;
          try {
            if (!entity) throw new Error('Entity class not provided to createBehaviors');
            console.log(entity);
            return await e.in.DRepository.DGet(entity, where, true);
          } catch (error) {
            console.error('DSave failed:', error);
            throw error;
          }
    };

    const DFindOneById =  async () => {
         if(!dEvent) return;
        const e = dEvent;
        let id = e.in.params['id_'+service_name];
        if (!id) id = e.in.body['id_'+service_name];
        if (!id) throw new Error('Entity class not provided to createBehaviors');
        if (!entity) throw new Error('Entity class not provided to createBehaviors');
        const projects =  await e.in.DRepository.DGet(entity, {
        where : {
            [config?.id_name ?? 'id']: id
        }
        }) as any; 
      return projects
    }

    const QueryBuilder = (name: boolean= false) => {
        if(!dEvent) return;
        if (!entity) throw new Error('Entity class not provided to createBehaviors');
        const e = dEvent;
       return (name) ? e.in.DB.getRepository(entity).createQueryBuilder() :
        e.in.DB.getRepository(entity).createQueryBuilder(simple_service_name);
    }

    const middlewares = defaultDMiddlewares(simple_service_name, config,  entity);

    const setDEvent = (e: DEvent) =>{
        dEvent = e;
    }
    // Optional getters
   
    const data = () => dEvent?.in.data;
    const body = () => dEvent?.in.body;
    const params = () => dEvent?.in.params;
    const query = () => dEvent?.in.query;
    //const extras = () => dEvent?.in.extras;
    const DRepository = () => dEvent?.in.DRepository;
    const Entity = typeof entity;

    const setData = (new_data: any) => {
        if(!dEvent) return;
        dEvent.in.data  = {
             ...dEvent.in.data,
             ...new_data
        }
    }
    return {
        [simple_service_name]: this,
        Entity,
        DRepository,
        QueryBuilder,
        setDEvent,
        DFindOne,
        DFindAll,
        DFindOneById,
        middlewares,
        data,
        setData,
        body,
        params,
        DSave,
        DGet,
        DPost,
        DDelete,
        DPatch,
        DPut,
        query,
        extras: DExtras,
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



