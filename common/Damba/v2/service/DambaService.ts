/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */

import { IDActionConfig, IServiceProvider, ServiceFn } from "./IServiceDamba";
import { DambaContext } from "./DambaContext";
import { createSimpleName } from "../../v1/service/DambaHelper";
import { DEvent } from "../../v1/service/DEvent";
import {
  ServiceConfig,
  DefaultDCrudValues,
} from "../../v1/service/ServiceConfig";
import { ServiceRegistry } from "../../v1/service/ServiceRegistry";
import { defaultDMiddlewares } from "../../v1/service/GenericMiddleware";

export type DEventHandler<REQ = any, RES = any, NEXT = any> = (
  e: DEvent<REQ, RES, NEXT>
) => Promise<any> | any;

export type DEventHandlerFactory<
  API = CreateBehaviorsReturn,
  REQ = any,
  RES = any,
  NEXT = any,
> = (api?: API) => DEventHandler<REQ, RES, NEXT>;

export type BehaviorsChain<REQ = any, RES = any, NEXT = any> = Record<
  string,
  DEventHandler<REQ, RES, NEXT>
>;

type AnyFn = (...args: any[]) => any;

/**
 * The typed return shape of createBehaviors.
 * (Kept mostly `any` to match the current implementation, but now the API is typed.)
 */
export type CreateBehaviorsReturn<
  T = any,
  REQ = any,
  RES = any,
  NEXT = any,
  ENTITY extends new (...args: any[]) => any = new (...args: any[]) => any,
> = {
  Entity: ENTITY | undefined; // runtime "typeof entity" is not representable; see below note
  DRepository: () => any;
  QueryBuilder: (name?: boolean) => any;

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
): Omit<CreateBehaviorsReturn<T, REQ, RES, NEXT, ENTITY>, "Entity"> & {
  Entity: ENTITY | undefined;
} => {
  const routes: Record<string, any> = {};
  name = name.trim();
  let service_name: string = name;
  let DExtras: any = {};

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
    if (config?.crud?.get.active)
      DGet(
        config?.crud_path + "",
        async (e: DEvent<REQ, RES, NEXT>) => {
          const req = e.in as any;
          const res = e.out as any;
          const entities = (await req.DRepository.DGet(
            entity,
            {},
            true
          )) as (typeof entity)[];
          return res.send(entities);
        },
        {},
        config?.crud?.get.middlewares
      );

    if (config?.crud?.get.active)
      DGet(
        config?.crud_path + "/:id",
        async (e: DEvent<REQ, RES, NEXT>) => {
          const req = e.in as any;
          const res = e.out as any;
          const id = req.params.id;
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
        config?.crud_path + "/:id/:relation",
        async (e: DEvent<REQ, RES, NEXT>) => {
          const req = e.in as any;
          const res = e.out as any;
          const id = req.params.id;
          const relation = String(req.params.relation) as any;

          if (!entity)
            return res.status(500).send({ message: "Entity not found" });

          const DRep = req.DRepository as any; // DambaRepository<any>
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
        config?.crud_path + "",
        async (e: DEvent<REQ, RES, NEXT>) => {
          const req = e.in as any;
          const res = e.out as any;
          const object = req.body as Partial<typeof entity>;
          const entities = await req.DRepository.DSave(entity, object);
          return res.send(entities);
        },
        {},
        config?.crud?.post?.middlewares
      );

    if (config?.crud?.patch?.active)
      DPatch(
        config?.crud_path + "/:id",
        async (e: DEvent<REQ, RES, NEXT>) => {
          const req = e.in as any;
          const res = e.out as any;
          const object = req.body as Partial<typeof entity> & { id: any };
          if (!req.params.id) res.status(404).send({});
          object.id = req.params.id;
          const entities = (await req.DRepository.DSave(
            entity,
            object
          )) as typeof entity;
          return res.status(200).json(entities);
        },
        {},
        config?.crud?.patch?.middlewares
      );

    if (config?.crud?.put?.active)
      DPut(
        config?.crud_path + "/:id",
        async (e: DEvent<REQ, RES, NEXT>) => {
          const req = e.in as any;
          const res = e.out as any;
          const object = req.body as typeof entity & { id: any };
          if (!req.params.id) res.status(404).send({});
          object.id = req.params.id;
          const entities = (await req.DRepository.DSave(
            entity,
            object
          )) as typeof entity;
          return res.send(entities);
        },
        {},
        config?.crud?.patch?.middlewares
      );

    if (config?.crud?.delete?.active)
      DDelete(
        config?.crud_path + "/:id",
        async (e: DEvent<REQ, RES, NEXT>) => {
          const req = e.in as any;
          const res = e.out as any;
          if (!req.params.id) res.status(404).send({});
          const id = req.params.id;
          const entities = await req.DRepository.DDelete(entity, {
            where: {
              [config?.id_name || "id"]: id,
            },
          });
          return res.send(entities);
        },
        {},
        config?.crud?.delete?.middlewares
      );
  };

  return {
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
            },
          }
        : {
            [service_name]: {
              service: routes,
              dbEntity: entity,
            },
          };
    },
  };
};
