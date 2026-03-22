import { DBEntities } from "./config/db";
import { DataSource } from "typeorm";
import { DambaTypeOrm } from "@Damba/v2/dao/DambaDb";
import { DBEnv } from "@Damba/v2/dao/IDb";
import { Database } from "@Damba/v2/config/IAppConfig";

let instance: Database<any> | null = null;
let initPromise: Promise<Database<any>> | null = null;

export const initOrm = async <DS>(env: DBEnv): Promise<Database<DS>> => {
  if (instance) {
    return instance as Database<DS>;
  }

  if (!initPromise) {
    initPromise = (async (): Promise<Database<any>> => {
      const orm = DambaTypeOrm.get(DataSource, env, DBEntities, {
        retries: 8,
        retryDelayMs: 1000,
        log: console.log,
      });

      const dataSource = (await orm.init()) as DataSource;
      orm.enableProcessSignalHandlers();

      instance = { orm, dataSource } as Database<any>;
      return instance;
    })();
  }

  return initPromise as Promise<Database<DS>>;
};