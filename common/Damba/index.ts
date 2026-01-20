/* eslint-disable @typescript-eslint/no-explicit-any */

import type { IAppConfig } from "./v1/config/IAppConfig";

interface IProcessHandler {
  /** NodeJS process event name (e.g. "SIGINT", "SIGTERM", "uncaughtException") */
  name: string;
  /** If true, handler will be invoked with the error payload */
  error: boolean;
  withoutError?: (server?: any) => void;
  withError?: (e: unknown, server?: any) => void;
}

interface IDambaParams<DS = any> {
  datasource: DS;
  _SPS_: any;

  AppConfig: IAppConfig<DS>;

  // Dependencies are injected for testability / portability
  express: any;
  route?: any;

  cors?: (options?: any) => any;
  bodyParser?: {
    json: (options?: any) => any;
    urlencoded: (options?: any) => any;
  };
  session?: (options?: any) => any;
  // Optional resources used by docs / tooling
  extras?: any;
  doc?: any;
  orm?: any;

  /**
   * Optional override of port (if your IAppConfig also contains a port,
   * this value can be used as a fallback)
   */
  port?: number;

  processes?: IProcessHandler[];
}

export class DambaApp<DS> {
  public readonly app: any;
  public readonly server?: any;

  constructor(params: IDambaParams<DS>) {
    this.assertValid(params);

    this.app = params.express();

    this.registerMiddleware(params);
    this.registerDocs(params);
    this.registerRoutes(params);

    this.server = this.launch(params);
    this.registerProcessHandlers(params);
  }

  private assertValid(params: IDambaParams<DS>) {
    if (!params?.AppConfig) throw new Error("DambaApp: AppConfig is required");
    if (typeof params.express !== "function")
      throw new Error("DambaApp: express() factory is required");
  }

  private registerMiddleware(params: IDambaParams<DS>) {
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
    if (AppConfig.call?.helper) {
      this.app.use(AppConfig.call.helper(params.datasource, params.extras));
    }
  }

  private registerDocs(params: IDambaParams<DS>) {
    const { AppConfig } = params;

    // Extras docs
    if (
      AppConfig.path?.docs?.extras &&
      AppConfig.call?.extrasDoc &&
      params.extras
    ) {
      this.app.use(
        AppConfig.path.docs.extras,
        AppConfig.call.extrasDoc(params.extras)
      );
    }

    // API docs
    if (AppConfig.path?.docs?.api && AppConfig.call?.apiDoc && params.doc) {
      this.app.use(AppConfig.path.docs.api, AppConfig.call.apiDoc(params.doc));
    }
  }

  private registerRoutes(params: IDambaParams<DS>) {
    const { AppConfig, route } = params;
    if (AppConfig.path?.basic && route) {
      this.app.use(AppConfig.path.basic, route);
    }
  }

  private launch(params: IDambaParams<DS>): any | undefined {
    const { AppConfig } = params;

    // Prefer explicit param port, fallback to AppConfig.port if present
    const port = params.port ?? (AppConfig as any).port;

    if (!AppConfig.call?.launch || !port) return undefined;

    return this.app.listen(port, () => {
      try {
        AppConfig.call.launch?.();
      } catch (e) {
        // Fail fast if launch callback is faulty
        // eslint-disable-next-line no-console
        console.error("DambaApp: launch callback threw:", e);
      }
    });
  }

  private registerProcessHandlers(params: IDambaParams<DS>) {
    if (!this.server) return;
    if (!params.processes?.length) return;

    for (const p of params.processes) {
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
  private static instance?: DambaApp<any>;

  private constructor() {}

  public static start<T>(params: IDambaParams<T>): DambaApp<T> {
    if (!this.instance) {
      this.instance = new DambaApp<T>(params);
    }
    return this.instance as DambaApp<T>;
  }

  public static getInstance<T = any>(): DambaApp<T> {
    if (!this.instance) {
      throw new Error("Damba: instance not started. Call Damba.start() first.");
    }
    return this.instance as DambaApp<T>;
  }
}
