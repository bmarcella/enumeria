/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSimpleName } from './DambaHelper';
import { DEvent } from './DEvent';
import { defaultDMiddlewares } from './GenericMiddleware';
import { IDActionConfig, IServiceProvider, ServiceFn } from './IServiceDamba';
import { DefaultDCrudValues, ServiceConfig } from './ServiceConfig';
import { ServiceRegistry } from './ServiceRegistry';

export const createBehaviors = <T, REQ, RES, NEXT>
    (name: string,
        entity?: new (...args: any[]) => any,
        config: ServiceConfig<REQ, RES, NEXT> = {
            id_name: 'id',
            crud_path:'/damba',
            crud: DefaultDCrudValues
        },
        _fmiddleware?: ((de: DEvent<REQ, RES, NEXT>) => any)[]) => {
    const routes: Record<string, any> = {};
    name = name.trim();
    let service_name: string = name;
    let dEvent: DEvent | null = null;
    let DExtras: Record<string, (...args: any[]) => any> = {};

    const simple_service_name = createSimpleName(service_name);

    const DAction = <REQ, RES, NEXT>(
        path: string,
        behavior: ServiceFn<REQ, RES, NEXT>,
        middleware?: ((req: REQ, res: RES, next: NEXT) => any)[] | [],
        extras?: Record<string, (...args: any[]) => any>,
        config?: IDActionConfig
    ) => {
        routes[path] = { behavior, middleware, extras, config }
    }

    const getMiddlewares = (_middleware?: ((de: DEvent<REQ, RES, NEXT>) => any)[] | []): any => {
        return _middleware && _middleware.length > 0
            ? _middleware.map((_mw) => {
                return (req: REQ, res: RES, next: NEXT) => {
                    const de = {
                        in: req,
                        out: res,
                        go: next,
                    } as DEvent<REQ, RES, NEXT>;
                    return _mw(de);
                };
            })
            : [];

    }


    const getBehaviors = (_middleware?: ((de: DEvent<REQ, RES, NEXT>) => any)[] | []): any => {
        return _middleware && _middleware.length > 0
            ? _middleware.map((_mw) => {
                return (req: REQ, res: RES, next: NEXT) => {
                    const de = {
                        in: req,
                        out: res,
                        go: next,
                    } as DEvent<REQ, RES, NEXT>;
                    setDEvent(de);
                    return _mw(de);
                };
            })
            : [];

    }

    const getBehavior = (_middleware: (de: DEvent<REQ, RES, NEXT>) => any): any => {
        return (req: REQ, res: RES, next: NEXT) => {
            const de = {
                in: req,
                out: res,
                go: next,
            } as DEvent<REQ, RES, NEXT>;
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
            _behavior: ServiceFn<REQ, RES, NEXT>[] | ServiceFn<REQ, RES, NEXT>,
            _extras?: Record<string, (...args: any[]) => any>,
            _middleware?: ((de: DEvent<REQ, RES, NEXT>) => any)[],
            _config?: IDActionConfig
        ) => {
            const middleware = getMiddlewares(_middleware);
            const behavior = Array.isArray(_behavior) ? getBehaviors(_behavior) : getBehavior(_behavior);
            DExtras = {
                ...DExtras,
                ..._extras
            }
            return DAction(buildPath(method, _path), behavior, middleware, _extras, _config);
        };
    };

    const DGet = makeRoute('GET')
    const DPost = makeRoute('POST')
    const DDelete = makeRoute('DELETE')
    const DPatch = makeRoute('PATCH')
    const DPut = makeRoute('PUT')

    const getContext = <REQ, RES, NEXT>(e: DEvent<REQ, RES, NEXT>) => {
        const req = e.in as any;
        const res = e.out as any;
        const next = e.go as any;
        return { req, res, next }
    }
   
    const runCrud = ()=>{
    
        if (config?.crud?.get.active)
            DGet(config?.crud_path+"", async (e: DEvent<REQ, RES, NEXT>) => {
                const { res, req } = getContext<REQ, RES, NEXT>(e);
                const entities = await req.DRepository.DGet(
                    entity, {}, true
                ) as typeof entity [];
                return res.send(entities);
            }, {}, config?.crud?.get.middlewares);

        if (config?.crud?.get.active)
            DGet(config?.crud_path+"/:id", async (e: DEvent<REQ, RES, NEXT>) => {
                const { res, req } = getContext<REQ, RES, NEXT>(e);
                const id = req.params.id;
                const entities = await req.DRepository.DGet(
                    entity, {
                        where : {
                            [config?.id_name || 'id'] : id
                        }
                    }
                ) as typeof entity;
                return res.send(entities);
            }, {}, config?.crud?.get.middlewares);

        if (config?.crud?.post?.active)
            DPost(config?.crud_path+"", async (e: DEvent<REQ, RES, NEXT>) => {
                const { res, req } = getContext<REQ, RES, NEXT>(e);
                const object = req.body as Partial<typeof entity>;
                const entities = await req.DRepository.DSave(
                    entity,
                    object
                );
                return res.send(entities);
            }, {}, config?.crud?.post?.middlewares)

        if (config?.crud?.patch?.active)
            DPatch(config?.crud_path+"/:id", async (e: DEvent<REQ, RES, NEXT>) => {

                const { res, req } = getContext<REQ, RES, NEXT>(e);

                const object = req.body as Partial<typeof entity> & {
                    id: any
                };
                if (!req.params.id) res.status(404).send({});
                object.id = req.params.id;
                const entities = await req.DRepository.DSave(
                    entity,
                    object,
                ) as typeof entity;
                return res.status(200).json(entities);
            }, {}, config?.crud?.patch?.middlewares)

        if (config?.crud?.patch?.active)
            DPut(config?.crud_path+"/:id", async (e: DEvent<REQ, RES, NEXT>) => {
                const { res, req } = getContext<REQ, RES, NEXT>(e);
                const object = req.body as typeof entity & {
                    id: any
                };
                if (!req.params.id) res.status(404).send({});
                object.id = req.params.id;
                const entities = await req.DRepository.DSave(
                    entity,
                    object,
                ) as typeof entity;
                return res.send(entities);
            }, {}, config?.crud?.patch?.middlewares)

        if (config?.crud?.delete?.active)
              DDelete(config?.crud_path+"/:id", async (e: DEvent<REQ, RES, NEXT>) => {
                const { res, req } = getContext<REQ, RES, NEXT>(e);
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
                return res.send(entities);
            }, {}, config?.crud?.delete?.middlewares)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const DSave = async (obj: any): Promise<any> => {
        if (!dEvent) return;
        const e = dEvent;
        try {
            if (!entity) throw new Error('Entity class not provided to createBehaviors');
            return await e.in.DRepository.DSave(entity, obj);
        } catch (error) {
            console.error('DSave failed:', error);
            throw error;
        }
    };

    const DFindOne = async (where: any): Promise<any> => {
        if (!dEvent) return;
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
        if (!dEvent) return;
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

    const DFindOneById = async () => {
        if (!dEvent) return;
        const e = dEvent;
        let id = e.in.params['id_' + service_name];
        if (!id) id = e.in.body['id_' + service_name];
        if (!id) throw new Error('Entity class not provided to createBehaviors');
        if (!entity) throw new Error('Entity class not provided to createBehaviors');
        const projects = await e.in.DRepository.DGet(entity, {
            where: {
                [config?.id_name ?? 'id']: id
            }
        }) as any;
        return projects
    }

    const QueryBuilder = (name: boolean = false) => {
        if (!dEvent) return;
        if (!entity) throw new Error('Entity class not provided to createBehaviors');
        const e = dEvent;
        return (name) ? e.in.DB.getRepository(entity).createQueryBuilder() :
            e.in.DB.getRepository(entity).createQueryBuilder(simple_service_name);
    }

    const middlewares = defaultDMiddlewares(simple_service_name, config, entity);

    const setDEvent = (e: DEvent<REQ, RES, NEXT>) => {
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
        if (!dEvent) return;
        dEvent.in.data = {
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
           if (entity) { runCrud(); }
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



