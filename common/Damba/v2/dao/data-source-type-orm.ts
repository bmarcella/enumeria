import { mustEnv } from "../../v1/config/ConfigHelper";
import { DBEnv } from "./IDb";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type InitableConnection = { initialize: () => Promise<any> };
export type ConnectionCtor<DS extends InitableConnection = InitableConnection> =
  new (options: any) => DS;

export function AppDataSource(
  DT: new (...args: any[]) => any,
  p: DBEnv,
  entities: any[],
  synchronize = true,
  logging = true,
  subscribers: any[] = [],
  migrations: any[] = [],
  extraOptions: Record<string, any> = {}
): typeof DT {
  const port = Number(mustEnv("DB_PORT"));
  if (!Number.isFinite(port))
    throw new Error(`Invalid DB_PORT "${p.DB_PORT}" (must be numeric)`);

  return new DT({
    type: mustEnv("DB_TYPE"),
    host: mustEnv("DB_HOST"),
    port,
    username: mustEnv("DB_USER"),
    password: mustEnv("DB_PASSWORD"),
    database: mustEnv("DB_NAME"),
    synchronize,
    entities,
    subscribers,
    migrations,
    logging,
    ...extraOptions,
  });
}
