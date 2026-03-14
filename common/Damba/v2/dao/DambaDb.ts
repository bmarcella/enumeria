import { AppDataSource } from "./data-source-type-orm";
import { DBEnv } from "./IDb";

export type DambaOrmOptions = {
  retries?: number; // default 5
  retryDelayMs?: number; // default 1200
  key?: string; // override cache key if needed
  log?: (msg: string, meta?: any) => void;
};

export class DambaTypeOrm<TDS> {
  private static instances = new Map<string, DambaTypeOrm<any>>();

  private readonly _dsPromise: TDS;
  private _initPromise?: TDS;
  private _initialized = false;

  private constructor(
    DT: new (...args: any[]) => TDS,
    env: DBEnv,
    entities: (new (...args: any[]) => any)[],
    private readonly opts: {
      retries: number;
      retryDelayMs: number;
      log?: (m: string, meta?: any) => void;
    }
  ) {
    this._dsPromise = AppDataSource(DT, env, entities) as TDS;
  }

  static get<TDS>(
    DT: new (...args: any[]) => TDS,
    env: DBEnv,
    entities: (new (...args: any[]) => any)[],
    options: DambaOrmOptions = {}
  ): DambaTypeOrm<TDS> {
    const key =
      options.key ??
      `${DT.name}:${stableStringify(env)}:${stableStringify(entities?.map((e: any) => e?.name ?? String(e)))}`;
    const existing = this.instances.get(key) as DambaTypeOrm<TDS> | undefined;
    if (existing) return existing;

    const instance = new DambaTypeOrm<TDS>(DT, env, entities, {
      retries: options.retries ?? 5,
      retryDelayMs: options.retryDelayMs ?? 1200,
      log: options.log,
    });
    this.instances.set(key, instance);
    return instance;
  }

  get datasource(): TDS | undefined {
    return this._dsPromise;
  }

  async init(): Promise<TDS> {
    if (this._initialized && this._initPromise) return this._initPromise;

    if (!this._initPromise) {
      this._initPromise = await this.initWithRetry();
    }
    return this._initPromise;
  }

  private async initWithRetry(): Promise<TDS> {
    const { retries, retryDelayMs, log } = this.opts;
    let lastError: unknown;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        log?.("DB init attempt", { attempt, retries });
        await (this._dsPromise as any).initialize();
        this._initialized = true;
        log?.("DB initialized");
        return this._dsPromise;
      } catch (err) {
        lastError = err;
        log?.("DB init failed", { attempt, err });
        if (attempt < retries) await sleep(retryDelayMs * attempt);
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new Error("Database initialization failed.");
  }

  async shutdown(signal?: string): Promise<void> {
    try {
      // If we never marked initialized, don't attempt closing
      if (!this._initialized) {
        this.opts.log?.("DB shutdown skipped (not initialized)", { signal });
        return;
      }

      // Prefer destroy(), then close()
      if (typeof (this._dsPromise as any).destroy === "function") {
        await (this._dsPromise as any).destroy();
        this.opts.log?.("DB closed (destroy)", { signal });
      } else if (typeof (this._dsPromise as any).close === "function") {
        await (this._dsPromise as any).close();
        this.opts.log?.("DB closed (close)", { signal });
      } else {
        this.opts.log?.("DB shutdown: no destroy/close method on datasource", {
          signal,
        });
      }
      this._initialized = false;
    } catch (err) {
      this.opts.log?.("DB shutdown error", { signal, err });
    }
  }

  enableProcessSignalHandlers(): void {
    const handler = async (sig: NodeJS.Signals) => {
      await this.shutdown(sig);
      process.exit(0);
    };
    process.once("SIGINT", handler);
    process.once("SIGTERM", handler);
  }
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
function stableStringify(value: any): string {
  return JSON.stringify(sortObject(value));
}
function sortObject(value: any): any {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc: any, k) => {
        acc[k] = sortObject(value[k]);
        return acc;
      }, {});
  }
  return value;
}
