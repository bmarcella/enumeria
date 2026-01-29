/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */

import {
  EventHandler,
  Http,
  IDActionConfig,
  IServiceProvider,
  ServiceFn,
} from "./IServiceDamba";
import { DambaContext } from "./DambaContext";
import { createSimpleName } from "./DambaHelper";
import { DEvent } from "./DEvent";
import {
  ServiceConfig,
  DefaultDCrudValues,
  CrudActions,
  CrudWorkerHandler,
  LoaderParams,
} from "./ServiceConfig";
import { ServiceRegistry } from "./ServiceRegistry";
import { defaultDMiddlewares } from "./GenericMiddleware";

export type DExtrasHandler = Record<string, AnyFn>;

export type DExtrasHandlerFactory<API = DambaApi> = (
  api?: API
) => DExtrasHandler;

export type Extras<API = DambaApi> = DExtrasHandlerFactory<API>;

export type DEventHandler<REQ = any, RES = any, NEXT = any> = (
  e: DEvent<REQ, RES, NEXT>
) => Promise<any> | any;

export type DEventHandlerFactory<
  API = DambaApi,
  REQ = any,
  RES = any,
  NEXT = any,
> = (
  api?: API
) => DEventHandler<REQ, RES, NEXT> | DEventHandler<REQ, RES, NEXT>[];

export type Behavior<
  API = DambaApi,
  REQ = any,
  RES = any,
  NEXT = any,
> = DEventHandlerFactory<API, REQ, RES, NEXT>;



export type BehaviorsChain<REQ = any, RES = any, NEXT = any> = Record<
  string,
  DEventHandler<REQ, RES, NEXT> | DEventHandler<REQ, RES, NEXT>[]
>;

export type BehaviorsChainLooperContent<
  T = any,
  REQ = any,
  RES = any,
  NEXT = any,
> = {
  behavior:
    | DEventHandlerFactory<DambaApi<T, REQ, RES, NEXT>, REQ, RES, NEXT>
    | Behavior<DambaApi<T, REQ, RES, NEXT>, REQ, RES, NEXT>;
  method: Http;
  extras?:
    | DExtrasHandlerFactory<DambaApi<T, REQ, RES, NEXT>>
    | Extras<DambaApi<T, REQ, RES, NEXT>>;
  middlewares?: ((de: DEvent<REQ, RES, NEXT>) => any)[];
  config?: IDActionConfig;
};

export type BehaviorsChainLooper<
  T = any,
  REQ = any,
  RES = any,
  NEXT = any,
> = Record<string, BehaviorsChainLooperContent<T, REQ, RES, NEXT>>;



export type EventBehaviorChainLooperContent<
  API = DambaApi,
  SK = any,
> = (
  api?: API
) => EventHandler<SK> ;

export type EventBehavior = EventBehaviorChainLooperContent;

export type  EventBehaviorChainLooper < API = DambaApi , SK = any > = Record<string, EventBehaviorChainLooperContent< API, SK>>;

export type EBChain = EventBehaviorChainLooper;

type AnyFn = (...args: any[]) => any;

/**
 * The typed return shape of createBehaviors.
 * (Kept mostly `any` to match the current implementation, but now the API is typed.)
 */
export type DambaApi<
  T = any,
  REQ = any,
  RES = any,
  NEXT = any,
  ENTITY extends new (...args: any[]) => any = new (...args: any[]) => any,
> = {
  simple_service_name: string,
  Entity: ENTITY | undefined; // runtime "typeof entity" is not representable; see below note
  DRepository: () => any;
  QueryBuilder: (name?: boolean) => any;
  on: <SK>(name: string , on : EventHandler<SK>)=> void
  DFindOne: (where: any) => Promise<any>;
  DFindAll: (where: any) => Promise<any>;
  DFindOneById: () => Promise<any>;

  middlewares: any;

  data: () => any;
  setData: (new_data: any) => void;

  body: () => any;
  params: () => any;
  query: () => any;

  DSave: (obj: any) => Promise<any>;

  DGet: (
    _path: string,
    _behavior: ServiceFn<REQ, RES, NEXT>[] | ServiceFn<REQ, RES, NEXT>,
    _extras?: Record<string, AnyFn>,
    _middleware?: ((de: DEvent<REQ, RES, NEXT>) => any)[],
    _config?: IDActionConfig
  ) => void;

  DPost: (
    _path: string,
    _behavior: ServiceFn<REQ, RES, NEXT>[] | ServiceFn<REQ, RES, NEXT>,
    _extras?: Record<string, AnyFn>,
    _middleware?: ((de: DEvent<REQ, RES, NEXT>) => any)[],
    _config?: IDActionConfig
  ) => void;

  DDelete: (
    _path: string,
    _behavior: ServiceFn<REQ, RES, NEXT>[] | ServiceFn<REQ, RES, NEXT>,
    _extras?: Record<string, AnyFn>,
    _middleware?: ((de: DEvent<REQ, RES, NEXT>) => any)[],
    _config?: IDActionConfig
  ) => void;

  DPatch: (
    _path: string,
    _behavior: ServiceFn<REQ, RES, NEXT>[] | ServiceFn<REQ, RES, NEXT>,
    _extras?: Record<string, AnyFn>,
    _middleware?: ((de: DEvent<REQ, RES, NEXT>) => any)[],
    _config?: IDActionConfig
  ) => void;

  DPut: (
    _path: string,
    _behavior: ServiceFn<REQ, RES, NEXT>[] | ServiceFn<REQ, RES, NEXT>,
    _extras?: Record<string, AnyFn>,
    _middleware?: ((de: DEvent<REQ, RES, NEXT>) => any)[],
    _config?: IDActionConfig
  ) => void;

  extras: any;

  done: () => IServiceProvider<REQ, RES, NEXT>;
};

export const DambaMakeApi = <REQ = any, RES = any, NEXT = any, SK= any> (
  api: DambaApi,
  behaviors?: BehaviorsChainLooper,
  events?: EventBehaviorChainLooper
): IServiceProvider<REQ, RES, NEXT> => {
  if(behaviors) {
    for (const [path, chain] of Object.entries(behaviors)) {
      const extras = chain.extras ? chain.extras(api) : undefined;
      switch (chain.method) {
        case Http.GET:
          api.DGet(
            path,
            chain.behavior(api),
            extras,
            chain.middlewares ?? [],
            chain.config
          );
          break;
        case Http.DELETE:
          api.DDelete(
            path,
            chain.behavior(api),
            extras,
            chain.middlewares ?? [],
            chain.config
          );
          break;
        case Http.PATCH:
          api.DPatch(
            path,
            chain.behavior(api),
            extras,
            chain.middlewares ?? [],
            chain.config
          );
          break;
        case Http.POST:
          api.DPost(
            path,
            chain.behavior(api),
            extras,
            chain.middlewares ?? [],
            chain.config
          );
          break;
        case Http.PUT:
          api.DPatch(
            path,
            chain.behavior(api),
            extras,
            chain.middlewares ?? [],
            chain.config
          );
          break;
      }
    }
  }
  if(events) {
    for (const [name, on] of Object.entries(events)) {
         api.on<SK>(`${api.simple_service_name}:${name}`, on(api))
    }
  }
  return api.done();
};

export type ServiceBuilderParams<T = any, REQ = any, RES = any, NEXT = any> = {
  service: DambaService<T, REQ, RES, NEXT>;
  behaviors?: BehaviorsChainLooper;
  events?: EventBehaviorChainLooper
};

export const createDambaService = <T = any, REQ = any, RES = any, NEXT = any, SK = any>(
  params: ServiceBuilderParams
): IServiceProvider<REQ, RES, NEXT> => {

  const api = createBehaviors<T, REQ, RES, NEXT>(
    params.service.name,
    params.service.entity as any,
    params.service.config,
    params.service.middlewares
  );
  return DambaMakeApi<REQ, RES, NEXT, SK>(api, params?.behaviors, params.events);
};

export type DambaService<T = any, REQ = any, RES = any, NEXT = any> = {
  name: string;
  entity?: T;
  config?: ServiceConfig<REQ, RES, NEXT>;
  middlewares?: ((de: DEvent<REQ, RES, NEXT>) => any)[];
};

/**
 * NOTE:
 * - TypeScript cannot use the runtime identifier `entity` inside a type like `Entity: typeof entity`.
 * - So we type Entity as the constructor type we receive (ENTITY), but since `entity` is optional,
 *   we return `ENTITY | undefined` (or `any` if you prefer).
 */
export type EntityCtor = new (...args: any[]) => any;

export const createBehaviors = <
  T,
  REQ,
  RES,
  NEXT,
  ENTITY extends EntityCtor = EntityCtor,
>(
  name: string,
  entity?: ENTITY,
  config: ServiceConfig<REQ, RES, NEXT> = {
    id_name: "id",
    crud_path: "/damba",
    crud: DefaultDCrudValues,
  },
  _fmiddleware?: ((de: DEvent<REQ, RES, NEXT>) => any)[]
): Omit<DambaApi<T, REQ, RES, NEXT, ENTITY>, "Entity"> & {
  Entity: ENTITY | undefined;
} => {
  const routes: Record<string, any> = {};
  const events: Record<string, EventHandler> = {}

  name = name.trim();
  let service_name: string = name;
  let DExtras: any = {};

  if (!config) {
    config = {
      id_name: "id",
      crud_path: "/damba",
      crud: DefaultDCrudValues,
    };
  }
  const simple_service_name = createSimpleName(service_name);


  const DAction = (
    path: string,
    behavior: any, // Express handler(s) ou array de handlers
    middleware?: ((req: REQ, res: RES, next: NEXT) => any)[] | [],
    extras?: Record<string, (...args: any[]) => any>,
    cfg?: IDActionConfig
  ) => {
    routes[path] = { behavior, middleware, extras, config: cfg };
  };



  /**
   * Enveloppe une fonction `(de: DEvent)` en handler Express
   * et crée un contexte AsyncLocalStorage par exécution.
   */
  const wrapDEventFn =
    (_fn: (de: DEvent<REQ, RES, NEXT>) => any, routeConfig?: IDActionConfig) =>
    (req: REQ, res: RES, next: NEXT) => {
      const de = { in: req, out: res, go: next } as DEvent<REQ, RES, NEXT>;
      const ctx = {
        event: de,
        serviceName: service_name,
        simpleServiceName: simple_service_name,
        entity,
        config,
        routeConfig,
      };
      return DambaContext.run<REQ, RES, NEXT>(ctx as any, () => _fn(de));
    };

  const getMiddlewares = (
    _middleware?: ((de: DEvent<REQ, RES, NEXT>) => any)[],
    routeConfig?: IDActionConfig
  ) =>
    _middleware?.length
      ? _middleware.map((mw) => wrapDEventFn(mw, routeConfig))
      : [];

  const getBehaviors = (
    _behavior: ServiceFn<REQ, RES, NEXT>[] | ServiceFn<REQ, RES, NEXT>,
    routeConfig?: IDActionConfig
  ) =>
    Array.isArray(_behavior)
      ? _behavior.map((b) => wrapDEventFn(b, routeConfig))
      : wrapDEventFn(_behavior, routeConfig);

  const buildPath = (method: string, path?: string) =>
    `${method}@${path ? path : ""}`;

  const makeRoute = (method: string) => {
    return (
      _path: string,
      _behavior: ServiceFn<REQ, RES, NEXT>[] | ServiceFn<REQ, RES, NEXT>,
      _extras?: Record<string, (...args: any[]) => any>,
      _middleware?: ((de: DEvent<REQ, RES, NEXT>) => any)[],
      _config?: IDActionConfig
    ) => {
      const middleware = getMiddlewares(_middleware, _config);
      const behavior = getBehaviors(_behavior, _config);

      DExtras[simple_service_name] = {
        ...(DExtras[simple_service_name] ?? {}),
        ..._extras,
      };

      return DAction(
        buildPath(method, _path),
        behavior,
        middleware,
        _extras,
        _config
      );
    };
  };

  const DGet = makeRoute("GET");
  const DPost = makeRoute("POST");
  const DDelete = makeRoute("DELETE");
  const DPatch = makeRoute("PATCH");
  const DPut = makeRoute("PUT");
  const on = (name: string, on: EventHandler)=>{
     events[name] = on;
  }

  const getContextOrThrow = () => {
    const ctx = DambaContext.get<REQ, RES, NEXT>();
    if (!ctx) {
      throw new Error(
        "DambaContext not available. Are you calling helpers en dehors d'une requête ?"
      );
    }
    return ctx;
  };

  /**
   * Helpers basés sur le contexte courant (PLUS de dEvent en closure)
   */

  const DSave = async (obj: any): Promise<any> => {
    const { event, entity } = getContextOrThrow();
    if (!entity)
      throw new Error("Entity class not provided to createBehaviors");

    const req = event.in as any;
    return req.DRepository.DSave(entity, obj);
  };

  const DFindOne = async (where: any): Promise<any> => {
    const { event, entity } = getContextOrThrow();
    if (!entity)
      throw new Error("Entity class not provided to createBehaviors");

    const req = event.in as any;
    return req.DRepository.DGet(entity, where, false);
  };

  const DFindAll = async (where: any): Promise<any> => {
    const { event, entity } = getContextOrThrow();
    if (!entity)
      throw new Error("Entity class not provided to createBehaviors");

    const req = event.in as any;
    return req.DRepository.DGet(entity, where, true);
  };

  const DFindOneById = async () => {
    const { event, entity } = getContextOrThrow();
    if (!entity)
      throw new Error("Entity class not provided to createBehaviors");

    const req = event.in as any;
    const idName = config?.id_name ?? "id";
    let id = req.params?.[idName];
    if (!id) id = req.body?.[idName];
    if (!id) throw new Error(`${idName} not found in params or body`);

    return req.DRepository.DGet(entity, {
      where: { [idName]: id },
    });
  };

  const QueryBuilder = (name = false) => {
    const { event, entity } = getContextOrThrow();
    if (!entity)
      throw new Error("Entity class not provided to createBehaviors");

    const req = event.in as any;
    return name
      ? req.DB.getRepository(entity).createQueryBuilder()
      : req.DB.getRepository(entity).createQueryBuilder(simple_service_name);
  };

  const middlewares = defaultDMiddlewares(simple_service_name, config, entity);

  const data = () => {
    const { event } = getContextOrThrow();
    const req = event.in as any;
    return req.data;
  };

  const body = () => {
    const { event } = getContextOrThrow();
    const req = event.in as any;
    return req.body;
  };

  const params = () => {
    const { event } = getContextOrThrow();
    const req = event.in as any;
    return req.params;
  };

  const query = () => {
    const { event } = getContextOrThrow();
    const req = event.in as any;
    return req.query;
  };

  const DRepository = () => {
    const { event } = getContextOrThrow();
    const req = event.in as any;
    return req.DRepository;
  };

  const Entity = entity;

  const setData = (new_data: any) => {
    const { event } = getContextOrThrow();
    const req = event.in as any;
    req.data = {
      ...(req.data ?? {}),
      ...new_data,
    };
  };

  /**
   * CRUD auto - même logique qu'avant
   */
  const runCrud = () => {
    const run = async <T>(
      params: LoaderParams,
      e: DEvent,
      callBack: CrudActions,
      previous: T
    ) => {
      try {
        return !previous ? callBack(e) : callBack(e, previous);
      } catch (error) {
        throw new Error(
          `Error on Method  ${params.method} in  ${params.action} at position ${params.index} `
        );
      }
    };
    const loader = async <T = any>(
      params: LoaderParams,
      e: DEvent,
      looper: CrudWorkerHandler,
      prev?: T | Partial<T> | any,
      before?: T | Partial<T> | any
    ) => {
      return new Promise(async (resolve) => {
        let previous: T | any = prev;
        let i = 0;
        try {
          for (let l of looper) {
            params.index = i;
            previous = await run<T>(params, e, l, previous);
            i++;
          }
          resolve(previous);
        } catch (error) {
          throw new Error(
            `Error on Method  ${params.method} in  ${params.action} at position ${params.index} `
          );
        }
      });
    };

    if (config?.crud?.all.active)
      DGet(
        config?.crud_path + config?.crud?.all.path,
        async (e: DEvent<REQ, RES, NEXT>) => {
          const req = e.in as any;
          const res = e.out as any;
          const befores = config?.crud?.all?.before ?? [];
          const afters = config?.crud?.all?.after ?? [];

          const before: T | Partial<T> | any = await loader<
            typeof entity | Partial<typeof entity>
          >({ method: "GET ALL", action: "BEFORE" }, e, befores, undefined);

          const entities = (await req.DRepository.DGet(
            entity,
            before.predicate && typeof before.predicate !== typeof entity
              ? before.predicate
              : {},
            true
          )) as (typeof entity)[];

          const after: T | Partial<T> | any = await loader<(typeof entity)[]>(
            { method: "GET ALL", action: "AFTER" },
            e,
            afters,
            entities,
            before
          );
          return res.send(after);
        },
        {},
        config?.crud?.get.middlewares
      );

    if (config?.crud?.get.active)
      DGet(
        config?.crud_path + config?.crud?.get.path + "/:id",
        async (e: DEvent<REQ, RES, NEXT>) => {
          const req = e.in as any;
          const res = e.out as any;
          const id = req.params.id;
          const befores = config?.crud?.get?.before ?? [];
          const afters = config?.crud?.get?.after ?? [];

          const before: T | Partial<T> | any = await loader<
            typeof entity | Partial<typeof entity>
          >({ method: "GET ONE", action: "BEFORE" }, e, befores, undefined);

          const entities = (await req.DRepository.DGet(entity, {
            where: {
              [config?.id_name || "id"]: id,
            },
          })) as typeof entity;
          return res.send(entities);
        },
        {},
        config?.crud?.get.middlewares
      );

    if (config?.crud?.get.active)
      DGet(
        config?.crud_path + config?.crud?.get.path + "/:id/:relation",
        async (e: DEvent<REQ, RES, NEXT>) => {
          const req = e.in as any;
          const res = e.out as any;
          const id = req.params.id;
          const relation = String(req.params.relation) as any;

          const befores = config?.crud?.get?.before ?? [];
          const afters = config?.crud?.get?.after ?? [];

          if (!entity)
            return res.status(500).send({ message: "Entity not found" });

          const before: T | Partial<T> | any = await loader<
            typeof entity | Partial<typeof entity>
          >({ method: "GET ALL", action: "BEFORE" }, e, befores, undefined);

          const DRep = req.DRepository as any;

          const rel = DRep.getRelation(entity, relation);
          let all = false;
          if (!rel)
            return res
              .status(400)
              .json({ error: `Unknown relation: ${relation}` });

          if (["many-to-one"].includes(rel.relationType)) {
            return res.status(400).json({
              error: "This endpoint is for collection relations only.",
            });
          }
          if (["one-to-many", "many-to-many"].includes(rel.relationType)) {
            all = true;
          }
          const entities = await DRep.DGet(
            entity,
            {
              where: { id },
              relations: { [relation]: true } as any,
            },
            all
          );
          return res.json((entities as any)[relation]);
        },
        {},
        config?.crud?.get.middlewares
      );

    if (config?.crud?.post?.active)
      DPost(
        config?.crud_path + config?.crud?.post.path + "",
        async (e: DEvent<REQ, RES, NEXT>) => {
          const req = e.in as any;
          const res = e.out as any;

          const befores = config?.crud?.post?.before ?? [];
          const afters = config?.crud?.post?.after ?? [];

          const object = req.body as Partial<typeof entity>;

          const before: T | Partial<T> | any = await loader<
            typeof entity | Partial<typeof entity>
          >({ method: "POST", action: "BEFORE" }, e, befores, object);

          let entities = {};

          if (before && befores.length > 0) {
            entities = await req.DRepository.DSave(entity, before);
          }

          if (!before && befores.length == 0) {
            entities = await req.DRepository.DSave(entity, object);
          }

          if (!before && befores.length > 0) {
            res.status(404).send({ message: `` });
          }

          const after: T | Partial<T> | any = await loader<(typeof entity)[]>(
            { method: "POST", action: "AFTER" },
            e,
            afters,
            entities,
            before
          );
          return res.send(after);
        },
        {},
        config?.crud?.post?.middlewares
      );

    if (config?.crud?.patch?.active)
      DPatch(
        config?.crud_path + config?.crud?.patch.path + "/:id",
        async (e: DEvent<REQ, RES, NEXT>) => {
          const req = e.in as any;
          const res = e.out as any;
          const object = req.body as Partial<typeof entity> & { id: any };
          const befores = config?.crud?.patch?.before ?? [];
          const afters = config?.crud?.patch?.after ?? [];

          if (!req.params.id) res.status(404).send({});
          object.id = req.params.id;

          const before: T | Partial<T> | any = await loader<
            typeof entity | Partial<typeof entity>
          >({ method: "PATCH", action: "BEFORE" }, e, befores, object);

          let entities: any = {};

          if (before && befores.length > 0) {
            entities = (await req.DRepository.DSave(entity, before)) as
              | typeof entity
              | undefined;
          }

          if (!before && befores.length == 0) {
            entities = (await req.DRepository.DSave(entity, object)) as
              | typeof entity
              | undefined;
          }

          if (!before && befores.length > 0) {
            res.status(404).send({ message: `` });
          }

          const after: T | Partial<T> | any = await loader<(typeof entity)[]>(
            { method: "PATCH", action: "AFTER" },
            e,
            afters,
            entities,
            before
          );

          return res.status(200).json(after);
        },
        {},
        config?.crud?.patch?.middlewares
      );

    if (config?.crud?.put?.active)
      DPut(
        config?.crud_path + config?.crud?.put.path + "/:id",
        async (e: DEvent<REQ, RES, NEXT>) => {
          const req = e.in as any;
          const res = e.out as any;
          const object = req.body as typeof entity & { id: any };

          const befores = config?.crud?.put?.before ?? [];
          const afters = config?.crud?.put?.after ?? [];

          if (!req.params.id) res.status(404).send({});

          const before: T | Partial<T> | any = await loader<
            typeof entity | Partial<typeof entity>
          >({ method: "PUT", action: "BEFORE" }, e, befores, object);

          let entities: any = {};

          object.id = req.params.id;

          if (before && befores.length > 0) {
            entities = (await req.DRepository.DSave(
              entity,
              before
            )) as typeof entity;
          }

          if (!before && befores.length == 0) {
            entities = (await req.DRepository.DSave(
              entity,
              object
            )) as typeof entity;
          }
          if (!before && befores.length > 0) {
            res.status(404).send({ message: `` });
          }
          const after: T | Partial<T> | any = await loader<(typeof entity)[]>(
            { method: "PUT", action: "AFTER" },
            e,
            afters,
            entities,
            before
          );
          return res.send(after);
        },
        {},
        config?.crud?.patch?.middlewares
      );
      
    if (config?.crud?.delete?.active)
      DDelete(
        config?.crud_path + config?.crud?.delete.path + "/:id",
        async (e: DEvent<REQ, RES, NEXT>) => {
          const req = e.in as any;
          const res = e.out as any;
          const befores = config?.crud?.put?.before ?? [];
          const afters = config?.crud?.put?.after ?? [];

          if (!req.params.id) res.status(404).send({});
          const id = req.params.id;

          const before: T | Partial<T> | any = await loader<
            typeof entity | Partial<typeof entity>
          >({ method: "DELETE", action: "BEFORE" }, e, befores, undefined);

          let entities: any = {};

          entities = await req.DRepository.DDelete(entity, {
            where: {
              [config?.id_name || "id"]: id,
            },
          });
          const after: T | Partial<T> | any = await loader<(typeof entity)[]>(
            { method: "DELETE", action: "AFTER" },
            e,
            afters,
            entities,
            before
          );
          return res.send(after);
        },
        {},
        config?.crud?.delete?.middlewares
      );
  };

  return {
    simple_service_name,
    Entity,
    DRepository,
    QueryBuilder,
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
    on,
    done: (): IServiceProvider<REQ, RES, NEXT> => {
      if (entity) {
        runCrud();
      }
      ServiceRegistry._init().populate(service_name, routes);
      const middleware = getMiddlewares(_fmiddleware);
      return middleware && middleware.length > 0
        ? {
            [service_name]: {
              service: routes,
              middleware,
              dbEntity: entity,
              events
            },
          }
        : {
            [service_name]: {
              service: routes,
              dbEntity: entity,
              events
            },
          };
    },
  };
};
