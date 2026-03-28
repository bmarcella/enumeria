/* eslint-disable @typescript-eslint/no-explicit-any */

import { IAppConfig } from "@Damba/v2/config/IAppConfig";
import {
  IDActionConfig,
  IModule,
  IServiceComplete,
  IServiceProvider,
  TimeoutType,
} from "../service/IServiceDamba";
import { toHttpEnum } from "@Damba/v2/service/DambaHelper";

const normalizePath = (p?: string) => {
  if (!p || p === "/") return "/";
  const clean = p.replace(/^\/+/, "");
  return `/${clean}`;
};

const toArray = <T>(m?: T | T[]) => (Array.isArray(m) ? m : m ? [m] : []);

export interface RouteDocEntry {
  fullPath: string;
  mount: string;
  method: string;
  path: string;
  decription?: string;
  serviceMiddlewareCount: number;
  routeMiddlewareCount: number;
  hasHandler: boolean;
  extras?: any;
  timeout?: TimeoutType;
  validators?: {
    params?: unknown;
    query?: unknown;
    body?: unknown;
    response?: { statusCode: number; schema: unknown };
  };
}

export type NestedApiDoc = Record<
  string, // mount e.g. "/users"
  Record<
    string, // method e.g. "GET"
    Record<
      string, // path e.g. "/:id"
      RouteDocEntry
    >
  >
>;
const DambaApiDocNested = <REQ, RES, NEXT>(
  modules: IModule<REQ, RES, NEXT>[],
  AppConfig?: IAppConfig,
): { doc: NestedApiDoc; extras: any } => {
  const basePath = AppConfig?.path.basic ?? "";
  const doc: NestedApiDoc = {};
  let extras: any = {};

  const _SPS_ = modules.reduce(
    (acc, module) => {
      return { ...acc, ...module.services };
    },
    {} as IServiceProvider<REQ, RES, NEXT>,
  );

  const makeExtrasMiddleware = (
    extrasObj: any,
    name: string,
    routeExtras?: any,
  ) => {
    const incoming = routeExtras ?? {};
    const existing = extrasObj?.[name] ?? {};
    return { ...extrasObj, [name]: { ...existing, ...incoming } };
  };

  for (const [serviceMount, serviceComplete] of Object.entries(_SPS_)) {
    const { service, middleware, rootExtras } =
      serviceComplete as IServiceComplete<REQ, RES, NEXT>;

    const serviceMws = toArray(middleware);
    const name = serviceMount.replace("/", "").toLowerCase();

    if (rootExtras) {
      extras = makeExtrasMiddleware(extras, name, rootExtras);
    }

    if (!doc[serviceMount]) doc[serviceMount] = {};

    for (const [key, value] of Object.entries(service ?? {})) {
      if (!value) continue;

      const [rawMethod, rawPath] = String(key).split("@");
      const methodEnum = toHttpEnum(rawMethod);

      if (!methodEnum) continue;

      const method = String(methodEnum); // works for string enums; if numeric you may want Http[methodEnum]
      const path = normalizePath(rawPath);
      const fullPath = `${basePath}${serviceMount}${path}`;

      const routeMws = toArray((value as any)?.middleware);
      const handler = (value as any)?.behavior;
      const config = (value as any)?.config as IDActionConfig;

      extras = makeExtrasMiddleware(extras, name, (value as any)?.extras);

      if (!doc[serviceMount][method]) doc[serviceMount][method] = {};

      doc[serviceMount][method][path] = {
        fullPath,
        mount: serviceMount,
        method,
        path,
        serviceMiddlewareCount: serviceMws.length,
        routeMiddlewareCount: routeMws.length,
        hasHandler: !!handler,
        extras: (value as any)?.extras,
        decription: config?.description,
        timeout: config?.timeout,
        validators: config?.validators,
      };
    }
  }

  return { doc, extras };
};

export default DambaApiDocNested;
