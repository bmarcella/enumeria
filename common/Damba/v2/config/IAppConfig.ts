/* eslint-disable @typescript-eslint/no-explicit-any */

import { AppHelperType, AppReadyType, AppShutdownParams } from "./ConfigHelper";

// --- Types externes personnalisés --- //
interface SessionCookieConfig {
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none";
  secure: boolean;
  maxAge: number;
}

interface SessionConfig {
  name: string;
  secret: string;
  resave: boolean;
  saveUninitialized: boolean;
  cookie: SessionCookieConfig;
}

interface JsonConfig {
  limit: string;
  type: "application/json";
}

interface UrlEncodedConfig {
  limit: string;
  extended: boolean;
}

// --- Définition de l'interface principale --- //
export interface IAppConfig<DS = any> {
  cors?: {
    allowedOrigins: any[];
    corsOptions: {
      checkOrigin: (origin: any, callback: any) => void;
      credentials: boolean;
    };
  };
  path: {
    basic: string;
    docs: {
      extras?: string;
      api?: string;
    };
    cicd: {
      ready?: string;
      health?: string;
    };
  };
  port: string;
  logRoute: boolean;
  version: number;
  json: JsonConfig;
  urlencoded: UrlEncodedConfig;
  session: SessionConfig;
  call: {
    helper: AppHelperType<DS>;
    launch?: () => void;
    ready?: AppReadyType;
    health?: AppReadyType;
    extrasDoc?: (extras: any) => any;
    apiDoc?: (api: any) => any;
    shutdown: (params: AppShutdownParams) => void;
  };
  authoriztion: {
    strategy: string;
    check: (roles: string[]) => any;
  };
  typeOrmDatabaseConfig?: {
    entities: any[];
  };
}
