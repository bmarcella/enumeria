/* eslint-disable @typescript-eslint/no-explicit-any */

import { IAppConfig } from "@Damba/v2/config/IAppConfig";
import {
  IDActionConfig,
  IModule,
  IServiceComplete,
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
  moduleMidlewareCount: number;
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

// Service-level doc: methods → paths → entry
export type ServiceDoc = Record<string, Record<string, RouteDocEntry>>;

// Module-level doc: module name → services → ServiceDoc
export interface ModuleDocEntry {
  name: string;
  middlewareCount: number;
  services: Record<string, ServiceDoc>;
}

export type ModularApiDoc = ModuleDocEntry[];

// Legacy flat format (still exported for JSON endpoints)
export type NestedApiDoc = Record<string, ServiceDoc>;

const DambaApiDocNested = <REQ, RES, NEXT>(
  modules: IModule<REQ, RES, NEXT>[],
  AppConfig?: IAppConfig,
): { doc: ModularApiDoc; flatDoc: NestedApiDoc; extras: Record<string, any>; modularExtras: Record<string, Record<string, any>> } => {
  const basePath = AppConfig?.path.basic ?? "";
  const modularDoc: ModularApiDoc = [];
  const flatDoc: NestedApiDoc = {};
  let extras: any = {};
  const modularExtras: Record<string, Record<string, any>> = {};

  const makeExtrasMiddleware = (
    extrasObj: any,
    name: string,
    routeExtras?: any,
  ) => {
    const incoming = routeExtras ?? {};
    const existing = extrasObj?.[name] ?? {};
    return { ...extrasObj, [name]: { ...existing, ...incoming } };
  };

  for (const mod of modules) {
    const moduleMws = toArray(mod.middleware);
    const moduleEntry: ModuleDocEntry = {
      name: mod.name,
      middlewareCount: moduleMws.length,
      services: {},
    };

    for (const [serviceMount, serviceComplete] of Object.entries(mod.services)) {
      const { service, middleware, rootExtras } =
        serviceComplete as IServiceComplete<REQ, RES, NEXT>;

      const serviceMws = toArray(middleware);
      const name = serviceMount.replace("/", "").toLowerCase();

      if (rootExtras) {
        extras = makeExtrasMiddleware(extras, name, rootExtras);
      }

      const serviceDoc: ServiceDoc = {};

      for (const [key, value] of Object.entries(service ?? {})) {
        if (!value) continue;

        const [rawMethod, rawPath] = String(key).split("@");
        const methodEnum = toHttpEnum(rawMethod);
        if (!methodEnum) continue;

        const method = String(methodEnum);
        const path = normalizePath(rawPath);
        const fullPath = `${basePath}${serviceMount}${path}`;

        const routeMws = toArray((value as any)?.middleware);
        const handler = (value as any)?.behavior;
        const config = (value as any)?.config as IDActionConfig;

        extras = makeExtrasMiddleware(extras, name, (value as any)?.extras);

        if (!serviceDoc[method]) serviceDoc[method] = {};

        serviceDoc[method][path] = {
          fullPath,
          mount: serviceMount,
          method,
          path,
          serviceMiddlewareCount: serviceMws.length,
          routeMiddlewareCount: routeMws.length,
          moduleMidlewareCount: moduleMws.length,
          hasHandler: !!handler,
          extras: (value as any)?.extras,
          decription: config?.description,
          timeout: config?.timeout,
          validators: config?.validators,
        };
      }

      moduleEntry.services[serviceMount] = serviceDoc;
      flatDoc[serviceMount] = serviceDoc;
    }

    modularDoc.push(moduleEntry);

    // Collect extras grouped by module
    const moduleExtrasForMod: Record<string, any> = {};
    for (const serviceMount of Object.keys(mod.services)) {
      const svcName = serviceMount.replace("/", "").toLowerCase();
      if (extras[svcName]) {
        moduleExtrasForMod[svcName] = extras[svcName];
      }
    }
    if (Object.keys(moduleExtrasForMod).length > 0) {
      modularExtras[mod.name] = moduleExtrasForMod;
    }
  }

  return { doc: modularDoc, flatDoc, extras, modularExtras };
};

export default DambaApiDocNested;
