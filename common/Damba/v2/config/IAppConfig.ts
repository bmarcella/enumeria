/* eslint-disable @typescript-eslint/no-explicit-any */

import { DambaTypeOrm } from "../dao/DambaDb";
import { AppHelperType, AppHelperTypeWDB, AppReadyType, AppShutdownParams } from "./ConfigHelper";

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
  type: string; // "application/json";
}

interface UrlEncodedConfig {
  limit: string;
  extended: boolean;
}

export interface Database<DS> {
  orm: DambaTypeOrm<DS>;
  dataSource: DS;
}

export interface DatabaseConfig<DS> {
  entities?: any[];
  initOrm: () => Database<DS> | Promise<Database<DS>>;
}

export interface IProcessHandler {
  /** NodeJS process event name (e.g. "SIGINT", "SIGTERM", "uncaughtException") */
  name: string;
  /** If true, handler will be invoked with the error payload */
  error: boolean;
  withoutError?: (server?: any) => void;
  withError?: (e: unknown, server?: any) => void;
}

export type LaunchSocket<S, IO> = (server: S) => IO;

export type OnConnect<S = any>= (socket: S) => void;
export type OnMessage<S = any>= (socket: S, payload: any) => void;
export type OnDisconnect<S = any, R = any>= (socket: S, reason: R) => void;
export type OnConnectError<S= any>= (socket: S) => void;
export type OnErrorSocket<S= any> = (socket: S, error: any) => void;
export type SocketConfig<S= any, IO = any> = 
{
      launch : LaunchSocket<S, IO>
      onConnect: OnConnect,
      onDisconnect?: OnDisconnect,
      onConnectError?: OnConnectError
      onError?: OnErrorSocket,
      onMessage?: OnMessage
      events?: Record<string, (socket: S, payload: any) => void>;
}

// --- Définition de l'interface principale --- //
export interface IAppConfig<DS = any,  S = any, IO= any >  {
  appName: string;
  description?: string;
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
    welcome: (appConfig: IAppConfig<DS>) => any;
  };
  authoriztion?: {
    strategy: string;
    check: (roles: string[]) => any;
  };
  processes?: (...args: any[]) => IProcessHandler[];
  databaseConfig?: DatabaseConfig<DS>;
  socket? : SocketConfig
}
