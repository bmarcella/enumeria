/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Database, IAppConfig, IProcessHandler } from "./config/IAppConfig";
import { DambaIO, DambaIOApp } from "./IO/DambaIO";
import { DambaRoute } from "./route/DambaRoute";
import DambaApiDocNested from "./route/DambaRouteDoc";
import { EventHandler, IServiceProvider } from "./service/IServiceDamba";
import { ServiceRegistry } from "./service/ServiceRegistry";

export interface IDambaParams<DS = any> {
  _SPS_: any;
  AppConfig: IAppConfig<DS>;
  // Dependencies are injected for testability / portability
  express: any;
  cors?: (options?: any) => any;
  bodyParser?: {
    json: (options?: any) => any;
    urlencoded: (options?: any) => any;
  };
  session?: (options?: any) => any;
  port?: number;
}

export class DambaApp<REQ = any, RES = any, NEXT= any, DS = any , IO = any> {
  public readonly app: any;
  public readonly server?: any;
  public dambaIo: DambaIOApp | undefined = undefined;
  constructor(params: IDambaParams<DS>, database?: Database<DS>) { 
    this.assertValid(params);
    const { route, extras, doc, events  } = this.DambaServices(params._SPS_, params.AppConfig, params);
    this.app = params.express();
    this.registerMiddleware(params, extras, database);
    this.registerDocs(params.AppConfig, extras, doc);
    this.registerRoutes(params.AppConfig, route);
    this.server = this.launch(params, events);
    this.registerProcessHandlers(params);
  }

  DambaServices = (
  _SPS_: IServiceProvider<REQ, RES, NEXT>,
  AppConfig: IAppConfig<DS>,
  params: IDambaParams<DS>) => {
  ServiceRegistry._init();
  const root = params.express.Router();
  const express = params.express as any;
  const { route, extras , events} = DambaRoute<REQ, REQ, NEXT, any>( { root, express },
    params._SPS_,
    AppConfig,
  );
  const { doc } = DambaApiDocNested<REQ, RES, NEXT>(_SPS_, AppConfig);
  return { route, extras, doc, events };
};

  private assertValid(params: IDambaParams<DS>) {
    if (!params?.AppConfig)
      throw new Error(`${params?.AppConfig.appName} AppConfig is required`);
    if (typeof params.express !== "function")
      throw new Error(
        `${params?.AppConfig.appName}: express() factory is required`
      );
  }

  private registerMiddleware(params: IDambaParams<DS>, extras: any, database?: Database<DS>) {
    const { AppConfig } = params;

    // CORS
    if (AppConfig.cors?.corsOptions && params.cors) {
      this.app.use(params.cors(AppConfig.cors.corsOptions));
    }

    // JSON body
    if (AppConfig.json && params.bodyParser?.json) {
      this.app.use(params.bodyParser.json(AppConfig.json));
    }

    // URL-encoded body
    if (AppConfig.urlencoded && params.bodyParser?.urlencoded) {
      this.app.use(params.bodyParser.urlencoded(AppConfig.urlencoded));
    }

    // Session
    if (AppConfig.session && params.session) {
      this.app.use(params.session(AppConfig.session));
    }

    // Helper
    if (AppConfig.call?.helper  ) {
      (database?.dataSource) ? this.app.use(AppConfig.call.helper( extras, database.dataSource))
      : this.app.use(AppConfig.call.helper(extras))
    }
    
  }

  private registerDocs(AppConfig: IAppConfig<DS>, extras: any, doc: any) {
    // Extras docs
    if (
      AppConfig.path?.docs?.extras &&
      AppConfig.call?.extrasDoc &&
      extras
    ) {
      this.app.use(
        AppConfig.path.docs.extras,
        AppConfig.call.extrasDoc(extras)
      );
    }

    // API docs
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

  private launch(params: IDambaParams<DS>, events: EventHandler): any | undefined {
    const { AppConfig } = params;

    // Prefer explicit param port, fallback to AppConfig.port if present
    const port = params.port ?? (AppConfig as any).port;
    if (!AppConfig.call?.launch || !port) return undefined;
    const server =  this.app.listen(port, () => {
      try {
        AppConfig.call.launch?.();
      } catch (e) {
        // Fail fast if launch callback is faulty
        // eslint-disable-next-line no-console
        console.error(
          `${params?.AppConfig.appName}: launch callback threw:`,
          e
        );
      }
    });

    if(this.app && AppConfig.socket?.launch){
       const io = AppConfig.socket.launch(server);
       this.app.locals.io = io;
       this.dambaIo = DambaIO.init<IO>(io, AppConfig.socket);
       this.dambaIo.init(events);
    }
    return server;
  }

  private registerProcessHandlers(params: IDambaParams<DS>, database?: Database<DS>) {
    if (!this.server) return;
          // process handlers (wired only after server starts, per your DambaApp)
    const processes = params.AppConfig?.processes ? params.AppConfig?.processes(database?.orm) : [];
    if (!processes?.length) return;

    for (const p of processes) {
      const handler = (payload: unknown) => {
        try {
          if (p.error && p.withError) p.withError(payload, this.server);
          else if (p.withoutError) p.withoutError(this.server);
        } catch (e) {
          // eslint-disable-next-line no-console
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

  public static async start<REQ = any, RES = any, NEXT = any, T = any, I = any>(params: IDambaParams<T>): Promise<DambaApp<REQ, RES, NEXT,  T, I>> {
       
    if (!this.instance) {
        let database;
        if (params.AppConfig.databaseConfig) {
             database = await params.AppConfig.databaseConfig.initOrm();
        }
        this.instance = new DambaApp<REQ, RES, NEXT,  T, I>(params, database);
    }
    return this.instance as DambaApp<REQ, RES, NEXT, T, I>;
  }

  public static getInstance<REQ, RES, NEXT, T = any , I = any>(): DambaApp<REQ, RES, NEXT,  T, I> {
    if (!this.instance) {
      throw new Error("Damba: instance not started. Call Damba.start() first.");
    }
    return this.instance as DambaApp<REQ, RES, NEXT,T, I>;
  }

}
