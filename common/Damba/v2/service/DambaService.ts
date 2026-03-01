/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */

import {
  AnyFn,
  EventHandler,
  Http,
  IDActionConfig,
  IServiceProvider,
  ServiceFn,
} from "./IServiceDamba";
import { DambaContext } from "./DambaContext";
import { createSimpleName, isArrayOfObjects } from "./DambaHelper";
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
import { QueueBehaviorContent } from "./QueueService";
import { getQueue, getQueueEvents, QCtor } from "./QueuesBull";
import { DambaRepository } from "../dao";
import { DambaApiType } from "./DambaApiType";

export type DambaApi<
  T = any,
  REQ = any,
  RES = any,
  NEXT = any,
  ENTITY extends new (...args: any[]) => any = new (...args: any[]) => any
> = DambaApiType;

export type DExtrasHandler = Record<string, AnyFn>;

type DExtrasHandlerFactory<API = DambaApi> = (api?: API) => DExtrasHandler;

export type Extras<API = DambaApi> = DExtrasHandlerFactory<API>;

export type DEventHandler<REQ = any, RES = any, NEXT = any> = (
  e: DEvent<REQ, RES, NEXT>
) => Promise<any> | any;

type DEventHandlerFactory<API = DambaApi, REQ = any, RES = any, NEXT = any> = (
  api?: API
) => DEventHandler<REQ, RES, NEXT> | DEventHandler<REQ, RES, NEXT>[];

export type Behavior<
  API = DambaApi,
  REQ = any,
  RES = any,
  NEXT = any
> = DEventHandlerFactory<API, REQ, RES, NEXT>;

export type BehaviorsChain<REQ = any, RES = any, NEXT = any> = Record<
  string,
  DEventHandler<REQ, RES, NEXT> | DEventHandler<REQ, RES, NEXT>[]
>;

type BehaviorChainLooperContent<T = any, REQ = any, RES = any, NEXT = any> = {
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

export type BehaviorsChainLooperContent<
  T = any,
  REQ = any,
  RES = any,
  NEXT = any
> =
  | BehaviorChainLooperContent<T, REQ, RES, NEXT>
  | BehaviorChainLooperContent<T, REQ, RES, NEXT>[];

export type BehaviorsChainLooper<
  T = any,
  REQ = any,
  RES = any,
  NEXT = any
> = Record<string, BehaviorsChainLooperContent<T, REQ, RES, NEXT>>;

type EventBehaviorChainLooperContent<API = DambaApi, SK = any> = (
  api?: API
) => EventHandler<SK>;

export type EventBehavior = EventBehaviorChainLooperContent;

export type EventBehaviorContent<API = any, SK = any, IO = any> = {
  message: EventBehavior;
  middleware: any[];
};

export type EventBehaviorChainLooper<
  API = DambaApi,
  SK = any,
  IO = any
> = Record<string, EventBehaviorContent<API, SK, IO>>;
export type EBChain = EventBehaviorChainLooper;

// Queues
export type QueueBehavior<Q = any, EQ = any> = Record<
  string,
  QueueBehaviorContent<Q, EQ>
>;

export const createDambaService = <
  T = any,
  REQ = any,
  RES = any,
  NEXT = any,
  SK = any
>(
  params: ServiceBuilderParams
): IServiceProvider<REQ, RES, NEXT> => {
  const api = createBehaviors<T, REQ, RES, NEXT>(
    params.service.name,
    params.service.entity as any,
    params.service.config,
    params.service.middlewares,
    params.service.redis
  );

  if (params.service.Queue) api.setQueue(params.service.Queue);

  return DambaMakeApi<
    REQ,
    RES,
    NEXT,
    SK,
    typeof params.service.Queue,
    typeof params.service.QueueEvents
  >(
    api,
    params?.behaviors,
    params?.events,
    params.queues,
    params.service.Queue,
    params.service.QueueEvents
  );
};

export const DambaMakeApi = <
  REQ = any,
  RES = any,
  NEXT = any,
  SK = any,
  Q = any,
  EQ = any
>(
  api: DambaApi,
  behaviors?: BehaviorsChainLooper,
  events?: EBChain,
  queues?: QueueBehavior<any, any>,
  QueueCtor?: QCtor<Q>,
  QueueEventsCtor?: QCtor<EQ>
): IServiceProvider<REQ, RES, NEXT> => {
  if (behaviors) {
    for (const [path, chains] of Object.entries(behaviors)) {
      const lchains = Array.isArray(chains) ? chains : [chains];
      for (let chain of lchains) {
        const handler = chain.behavior(api);
        const extras = chain.extras ? chain.extras(api) : undefined;
        const middlewares = chain.middlewares ?? [];
        switch (chain.method) {
          case Http.GET:
            api.DGet(path, handler, extras, middlewares, chain.config);
            break;

          case Http.DELETE:
            api.DDelete(path, handler, extras, middlewares, chain.config);
            break;

          case Http.PATCH:
            api.DPatch(path, handler, extras, middlewares, chain.config);
            break;

          case Http.POST:
            api.DPost(path, handler, extras, middlewares, chain.config);
            break;

          case Http.PUT:
            api.DPut(path, handler, extras, middlewares, chain.config);
            break;

          default:
            // optional: throw or ignore
            throw new Error(`Unsupported HTTP method: ${String(chain.method)}`);
        }
      }
    }
  }

  if (events) {
    for (const [name, on] of Object.entries(events)) {
      const messageName = `${api.simple_service_name}:${name}`;
      api.on<SK>(messageName, on.message(api));
    }
  }

  if (queues) {
    const redisConnection = (api as any).__redis;
    if (!redisConnection)
      throw new Error("Redis connection missing for queues");

    if (!QueueCtor) throw new Error("Queue ctor missing (pass service.Queue)");
    if (!QueueEventsCtor)
      throw new Error("QueueEvents ctor missing (pass service.QueueEvents)");

    for (const [name, cfg] of Object.entries(queues)) {
      // instantiate Queue
      getQueue(QueueCtor, name, redisConnection, cfg.options);
      // instantiate EventQueue
      const ev = cfg?.events;
      getQueueEvents(QueueEventsCtor, name, redisConnection, api, ev) as any;
    }
  }

  return api.done();
};

export type ServiceBuilderParams<T = any, REQ = any, RES = any, NEXT = any> = {
  service: DambaService<T, REQ, RES, NEXT>;
  behaviors?: BehaviorsChainLooper;
  events?: EventBehaviorChainLooper;
  queues?: QueueBehavior<any, any>;
};

export type DambaService<
  T = any,
  REQ = any,
  RES = any,
  NEXT = any,
  REDIS = any
> = {
  name: string;
  entity?: T;
  config?: ServiceConfig<REQ, RES, NEXT>;
  middlewares?: ((de: DEvent<REQ, RES, NEXT>) => any)[];
  redis?: REDIS;
  // BullMQ constructors passed by the app layer
  Queue?: QCtor<any>;
  QueueEvents?: QCtor<any>;
};

export type EntityCtor = new (...args: any[]) => any;

export const createBehaviors = <
  T,
  REQ,
  RES,
  NEXT,
  ENTITY extends EntityCtor = EntityCtor
>(
  name: string,
  entity?: ENTITY,
  config: ServiceConfig<REQ, RES, NEXT> = {
    id_name: "id",
    crud_path: "/damba",
    crud: DefaultDCrudValues,
  },
  _fmiddleware?: ((de: DEvent<REQ, RES, NEXT>) => any)[],
  redis?: any
): Omit<DambaApi<T, REQ, RES, NEXT, ENTITY>, "Entity"> & {
  Entity: ENTITY | undefined;
} => {
  const routes: Record<string, any> = {};
  const events: Record<string, EventHandler> = {};
  let Queue: QCtor<any>;

  const redisConnection = redis;
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

  const setQueue = <NQ>(ctor: QCtor<NQ>) => {
    Queue = ctor;
  };

  // CHANGE: expose queue/enqueue and ensure redis exists
  const queue = <NQ = any>(name: string) => {
    if (!redisConnection)
      throw new Error("Redis connection is required for queues");
    if (!Queue) throw new Error("Queue ctor is required");
    return getQueue(Queue, name, redisConnection) as NQ;
  };

  const enqueue = async <E = any>(
    name: string,
    data: E,
    opts?: any,
    jobName = "job"
  ) => {
    const q = queue<typeof Queue>(name) as any;
    if (!q) throw new Error("Queue does not exist.");
    const job = await q.add(jobName, data, opts);
    return { jobId: String(job.id), full: job };
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
  const on = (name: string, on: EventHandler) => {
    events[name] = on;
  };

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

  const DRepository = (): DambaRepository => {
    const { event } = getContextOrThrow();
    const req = event.in as any;
    return req.DRepository as DambaRepository;
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
      previous?: T
    ) => {
      try {
        // Only pass "previous" when it exists
        return previous === undefined
          ? await callBack(e)
          : await callBack(e, previous);
      } catch {
        throw new Error(
          `Error on Method ${params.method} in ${params.action} at position ${params.index}`
        );
      }
    };

    const loader = async <T = any>(
      params: LoaderParams,
      e: DEvent,
      looper: CrudWorkerHandler,
      prev?: T,
      _before?: any
    ) => {
      let previous: T | any = prev;
      let i = 0;

      for (const l of looper) {
        params.index = i;
        previous = await run<T>(params, e, l, previous);
        i++;
      }

      return previous as T;
    };

    // ---------------------------
    // GET ALL
    // ---------------------------
    if (config?.crud?.all?.active)
      DGet(
        config?.crud_path + config?.crud?.all.path,
        async (e: DEvent<REQ, RES, NEXT>) => {
          const req = e.in as any;
          const res = e.out as any;

          const befores = config?.crud?.all?.before ?? [];
          const afters = config?.crud?.all?.after ?? [];

          let before: any | undefined;

          if (befores.length > 0) {
            before = await loader<typeof entity | Partial<typeof entity>>(
              { method: "GET ALL", action: "BEFORE" },
              e,
              befores,
              undefined
            );
          }

          const predicate =
            before?.predicate && typeof before.predicate === "object"
              ? before.predicate
              : {};

          const entities = (await req.DRepository.DGet(
            entity,
            predicate,
            true
          )) as (typeof entity)[];

          let after: any = entities;
          if (afters.length > 0) {
            after = await loader<(typeof entity)[]>(
              { method: "GET ALL", action: "AFTER" },
              e,
              afters,
              entities,
              before
            );
          }

          return res.send(after);
        },
        {},
        config?.crud?.all?.middlewares
      );
    // ---------------------------
    // GET ONE
    // ---------------------------
    if (config?.crud?.get?.active)
      DGet(
        config?.crud_path + config?.crud?.get.path + "/:id",
        async (e: DEvent<REQ, RES, NEXT>) => {
          const req = e.in as any;
          const res = e.out as any;
          const id = req.params.id;

          const befores = config?.crud?.get?.before ?? [];
          const afters = config?.crud?.get?.after ?? [];

          let before: any | undefined;

          if (befores.length > 0) {
            before = await loader<typeof entity | Partial<typeof entity>>(
              { method: "GET ONE", action: "BEFORE" },
              e,
              befores,
              undefined
            );
          }

          const where =
            before?.predicate && typeof before.predicate === "object"
              ? before.predicate
              : { [config?.id_name || "id"]: id };

          const entityResult = (await req.DRepository.DGet(entity, {
            where,
          })) as typeof entity;

          let after: any = entityResult;
          if (afters.length > 0) {
            after = await loader<typeof entity>(
              { method: "GET ONE", action: "AFTER" },
              e,
              afters,
              entityResult,
              before
            );
          }

          return res.send(after);
        },
        {},
        config?.crud?.get?.middlewares
      );
    // ---------------------------
    // GET RELATION (collection)
    // ---------------------------
    if (config?.crud?.get?.active)
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

          let before: any | undefined;
          if (befores.length > 0) {
            before = await loader<typeof entity | Partial<typeof entity>>(
              { method: "GET RELATION", action: "BEFORE" },
              e,
              befores,
              undefined
            );
          }

          const DRep = req.DRepository as any;
          const rel = DRep.getRelation(entity, relation);

          if (!rel) {
            return res
              .status(400)
              .json({ error: `Unknown relation: ${relation}` });
          }

          if (["many-to-one"].includes(rel.relationType)) {
            return res.status(400).json({
              error: "This endpoint is for collection relations only.",
            });
          }

          const all = ["one-to-many", "many-to-many"].includes(
            rel.relationType
          );

          const entityWithRel = await DRep.DGet(
            entity,
            {
              where: { id },
              relations: { [relation]: true } as any,
            },
            all
          );

          let result: any = (entityWithRel as any)[relation];

          if (afters.length > 0) {
            result = await loader<any>(
              { method: "GET RELATION", action: "AFTER" },
              e,
              afters,
              result,
              before
            );
          }

          return res.json(result);
        },
        {},
        config?.crud?.get?.middlewares
      );
    // ---------------------------
    // POST
    // ---------------------------
    if (config?.crud?.post?.active)
      DPost(
        config?.crud_path + config?.crud?.post.path,
        async (e: DEvent<REQ, RES, NEXT>) => {
          const req = e.in as any;
          const res = e.out as any;

          const befores = config?.crud?.post?.before ?? [];
          const afters = config?.crud?.post?.after ?? [];

          const object = req.body as Partial<typeof entity>;

          let before: any | undefined = object;

          if (befores.length > 0) {
            before = await loader<typeof entity | Partial<typeof entity>>(
              { method: "POST", action: "BEFORE" },
              e,
              befores,
              object
            );
          }

          if (!before) return res.status(404).send({ message: "" });

          const saved = await req.DRepository.DSave(entity, before);

          let after: any = saved;
          if (afters.length > 0) {
            after = await loader<any>(
              { method: "POST", action: "AFTER" },
              e,
              afters,
              saved,
              before
            );
          }

          return res.send(after);
        },
        {},
        config?.crud?.post?.middlewares
      );

    // ---------------------------
    // PATCH
    // ---------------------------
    if (config?.crud?.patch?.active)
      DPatch(
        config?.crud_path + config?.crud?.patch.path + "/:id",
        async (e: DEvent<REQ, RES, NEXT>) => {
          const req = e.in as any;
          const res = e.out as any;

          if (!req.params.id) return res.status(404).send({});

          const befores = config?.crud?.patch?.before ?? [];
          const afters = config?.crud?.patch?.after ?? [];

          const object = req.body as Partial<typeof entity> & { id: any };
          object.id = req.params.id;

          let before: any | undefined = object;

          if (befores.length > 0) {
            before = await loader<typeof entity | Partial<typeof entity>>(
              { method: "PATCH", action: "BEFORE" },
              e,
              befores,
              object
            );
          }

          if (!before) return res.status(404).send({ message: "" });

          const saved = await req.DRepository.DSave(entity, before);

          let after: any = saved;
          if (afters.length > 0) {
            after = await loader<any>(
              { method: "PATCH", action: "AFTER" },
              e,
              afters,
              saved,
              before
            );
          }

          return res.status(200).json(after);
        },
        {},
        config?.crud?.patch?.middlewares
      );

    // ---------------------------
    // PUT
    // ---------------------------
    if (config?.crud?.put?.active)
      DPut(
        config?.crud_path + config?.crud?.put.path + "/:id",
        async (e: DEvent<REQ, RES, NEXT>) => {
          const req = e.in as any;
          const res = e.out as any;

          if (!req.params.id) return res.status(404).send({});

          const befores = config?.crud?.put?.before ?? [];
          const afters = config?.crud?.put?.after ?? [];

          const object = req.body as typeof entity & { id: any };
          object.id = req.params.id;

          let before: any | undefined = object;

          if (befores.length > 0) {
            before = await loader<typeof entity | Partial<typeof entity>>(
              { method: "PUT", action: "BEFORE" },
              e,
              befores,
              object
            );
          }

          if (!before) return res.status(404).send({ message: "" });

          const saved = await req.DRepository.DSave(entity, before);

          let after: any = saved;
          if (afters.length > 0) {
            after = await loader<any>(
              { method: "PUT", action: "AFTER" },
              e,
              afters,
              saved,
              before
            );
          }

          return res.send(after);
        },
        {},
        config?.crud?.put?.middlewares // ✅ was patch.middlewares in your code
      );

    // ---------------------------
    // DELETE
    // ---------------------------
    if (config?.crud?.delete?.active)
      DDelete(
        config?.crud_path + config?.crud?.delete.path + "/:id",
        async (e: DEvent<REQ, RES, NEXT>) => {
          const req = e.in as any;
          const res = e.out as any;

          if (!req.params.id) return res.status(404).send({});

          const id = req.params.id;

          const befores = config?.crud?.delete?.before ?? [];
          const afters = config?.crud?.delete?.after ?? [];

          let before: any | undefined;

          if (befores.length > 0) {
            before = await loader<typeof entity | Partial<typeof entity>>(
              { method: "DELETE", action: "BEFORE" },
              e,
              befores,
              undefined
            );
          }

          const deleted = await req.DRepository.DDelete(entity, {
            [config?.id_name || "id"]: id,
          });

          let after: any = deleted;
          if (afters.length > 0) {
            after = await loader<any>(
              { method: "DELETE", action: "AFTER" },
              e,
              afters,
              deleted,
              before
            );
          }

          return res.send(after);
        },
        {},
        config?.crud?.delete?.middlewares
      );
  };

  return {
    simple_service_name,
    __redis: redisConnection,
    Entity,
    // CHANGE: expose queue helpers
    queue,
    setQueue,
    enqueue,
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
      const middleware = getMiddlewares(_fmiddleware);
      const isMiddlewaye = middleware && middleware.length > 0;
      ServiceRegistry._init().populate(service_name);
      const IProvider = isMiddlewaye
        ? {
            [service_name]: {
              service: routes,
              middleware,
              dbEntity: entity,
              events,
            },
          }
        : {
            [service_name]: {
              service: routes,
              dbEntity: entity,
              events,
            },
          };
      return IProvider as IServiceProvider<REQ, RES, NEXT>;
    },
  };
};
