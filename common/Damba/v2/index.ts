/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Database, IAppConfig } from "./config/IAppConfig";
import { DambaIO, DambaIOApp } from "./IO/DambaIO";
import { SocketRegistry } from "./IO/RegistrySocket";
import { DambaRoute } from "./route/DambaRoute";
import DambaApiDocNested from "./route/DambaRouteDoc";
import { IModule, SocketEventHandlerChain } from "./service/IServiceDamba";
import { runWithQueueContext } from "./service/QueuesBull";
import { ServiceRegistry } from "./service/ServiceRegistry";
import {
  createErrorHandler,
  NotFoundError,
  DambaErrorHandlerOptions,
} from "./errors";
import createWelcomeHandler from "./Ui";

export interface IDambaParams<DS = any> {
  modules: IModule<any, any, any>[];
  AppConfig: IAppConfig<DS>;
  express: any;
  cors?: (options?: any) => any;
  bodyParser?: {
    json: (options?: any) => any;
    urlencoded: (options?: any) => any;
  };
  session?: (options?: any) => any;
  port?: number;
  queue?: {
    tenant: string;
    correlation: string;
  };
  db?: { orm: any; dataSource: DS };
  googleAuth: any;
  errorHandler?: DambaErrorHandlerOptions | false;
}
export class DambaApp<REQ = any, RES = any, NEXT = any, DS = any, IO = any> {
  public readonly app: any;
  public readonly server?: any;
  public dambaIo: DambaIOApp | undefined = undefined;
  constructor(params: IDambaParams<DS>, database?: Database<DS>) {
    this.assertValid(params);
    const { route, extras, doc, events } = this.DambaServices(
      params.modules,
      params.AppConfig,
      params,
    );
    this.app = params.express();
    this.registerMiddleware(params, extras, database);
    this.registerDocs(params.AppConfig, extras, doc);
    this.registerRoutes(params.AppConfig, route);
    this.registerErrorHandler(params);
    this.server = this.launch(params, events);
    this.registerProcessHandlers(params, database);
  }

  DambaServices = (
    modules: IModule<any, any, any>[],
    AppConfig: IAppConfig<DS>,
    params: IDambaParams<DS>,
  ) => {
    ServiceRegistry._init();

    const root = params.express.Router();
    const express = params.express as any;

    const { route, extras, events } = DambaRoute<REQ, RES, NEXT, any>(
      { root, express },
      modules,
      AppConfig,
    );
    const { doc } = DambaApiDocNested<REQ, RES, NEXT>(modules, AppConfig);
    return { route, extras, doc, events };
  };

  private assertValid(params: IDambaParams<DS>) {
    if (!params?.AppConfig) {
      throw new Error("Damba: AppConfig is required");
    }

    if (typeof params.express !== "function") {
      throw new Error(
        `${params.AppConfig.appName}: express() factory is required`,
      );
    }
  }

  private registerMiddleware(
    params: IDambaParams<DS>,
    extras: any,
    database?: Database<DS>,
  ) {
    const { AppConfig, queue } = params;

    if (AppConfig.cors?.corsOptions && params.cors) {
      this.app.use(params.cors(AppConfig.cors.corsOptions));
    }

    if (AppConfig.json && params.bodyParser?.json) {
      this.app.use(params.bodyParser.json(AppConfig.json));
    }

    if (AppConfig.urlencoded && params.bodyParser?.urlencoded) {
      this.app.use(params.bodyParser.urlencoded(AppConfig.urlencoded));
    }

    if (AppConfig.session && params.session) {
      this.app.use(params.session(AppConfig.session));
    }

    if (AppConfig.call?.helper) {
      if (database?.dataSource) {
        this.app.use(AppConfig.call.helper(extras, database.dataSource));
      } else {
        this.app.use(AppConfig.call.helper(extras));
      }
    }

    if (queue) {
      this.app.use((req: any, _res: any, next: any) => {
        const tenant = req.header(queue.tenant) ?? "default";
        const correlationId = req.header(queue.correlation) ?? undefined;
        try {
          return runWithQueueContext({ keyPrefix: tenant, correlationId }, () =>
            next(),
          );
        } catch (err) {
          return next(err);
        }
      });
    }
  }

  private registerDocs(AppConfig: IAppConfig<DS>, extras: any, doc: any) {
    if (AppConfig.path?.docs?.extras && AppConfig.call?.extrasDoc && extras) {
      this.app.use(
        AppConfig.path.docs.extras,
        AppConfig.call.extrasDoc(extras),
      );
    }

    if (AppConfig.path?.docs?.api && AppConfig.call?.apiDoc && doc) {
      this.app.use(AppConfig.path.docs.api, AppConfig.call.apiDoc(doc));
    }
  }

  private registerRoutes(AppConfig: IAppConfig<DS>, route: any) {
    if (AppConfig.call?.welcome) {
      this.app.get("/", AppConfig.call.welcome(AppConfig));
    }

    if (AppConfig.path?.basic && route) {
      this.app.use(AppConfig.path.basic, route);
    }
  }

  private registerErrorHandler(params: IDambaParams<DS>) {
    // Skip if explicitly disabled
    if (params.errorHandler === false) return;

    // 404 catch-all for unmatched routes
    this.app.use((req: any, _res: any, next: any) => {
      next(
        new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`),
      );
    });

    const options: DambaErrorHandlerOptions = params.errorHandler ?? {};
    this.app.use(createErrorHandler(options));
  }

  private launch(
    params: IDambaParams<DS>,
    events: SocketEventHandlerChain,
  ): any | undefined {
    const { AppConfig } = params;
    const port = params.port ?? (AppConfig as any).port;

    if (!AppConfig.call?.launch || !port) {
      return undefined;
    }

    const server = this.app.listen(port, () => {
      try {
        AppConfig.call.launch?.();
      } catch (e) {
        console.error(`${AppConfig.appName}: launch callback threw:`, e);
      }
    });

    if (this.app && AppConfig.socket?.launch) {
      const io = AppConfig.socket.launch(server);
      this.app.locals.io = io;
      this.dambaIo = DambaIO.init<IO>(io, AppConfig.socket, params.googleAuth);
      SocketRegistry.init({ io });
      this.dambaIo?.init(events);
    }

    return server;
  }

  private registerProcessHandlers(
    params: IDambaParams<DS>,
    database?: Database<DS>,
  ) {
    if (!this.server) return;

    const processes = params.AppConfig?.processes
      ? params.AppConfig.processes(database?.orm)
      : [];

    if (!processes?.length) return;

    for (const p of processes) {
      const handler = (payload: unknown) => {
        try {
          if (p.error && p.withError) {
            p.withError(payload, this.server);
          } else if (p.withoutError) {
            p.withoutError(this.server);
          }
        } catch (e) {
          console.error(`DambaApp: process handler "${p.name}" threw:`, e);
        }
      };

      process.once(p.name as any, handler);
    }
  }
}

export default class Damba {
  private static instance?: DambaApp;

  private constructor() {}

  public static async start<REQ = any, RES = any, NEXT = any, T = any, I = any>(
    params: IDambaParams<T>,
  ): Promise<DambaApp<REQ, RES, NEXT, T, I>> {
    if (!this.instance) {
      let database: Database<T> | undefined;

      if (!params.AppConfig.call?.welcome) {
        params.AppConfig.call.welcome = createWelcomeHandler;
      }

      // if (!params.AppConfig.call?.apiDocUi) {
      //   params.AppConfig.call.apiDocUi = createApiDocUiHandler;
      // }

      // if (!params.AppConfig.call?.extrasDocUi) {
      //   params.AppConfig.call.extrasDocUi = createExtrasDocUiHandler;
      // }

      if (params.AppConfig.databaseConfig) {
        database = await params.AppConfig.databaseConfig.initOrm();
      } else if (params.db) {
        database = params.db;
      }

      this.instance = new DambaApp<REQ, RES, NEXT, T, I>(params, database);
    }

    return this.instance;
  }

  public static getInstance<REQ, RES, NEXT, T = any, I = any>(): DambaApp<
    REQ,
    RES,
    NEXT,
    T,
    I
  > {
    if (!this.instance) {
      throw new Error("Damba: instance not started. Call Damba.start() first.");
    }

    return this.instance as DambaApp<REQ, RES, NEXT, T, I>;
  }
}
