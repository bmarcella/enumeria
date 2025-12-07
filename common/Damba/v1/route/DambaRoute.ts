
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IAppConfig } from "../config/IAppConfig";
import { toHttpEnum } from "../service/DambaHelper";
import { Http, IDActionConfig, IServiceComplete, IServiceProvider } from "../service/IServiceDamba";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// export type ExtrasMap = Record<string, (...args: any[]) => any>
export type ExtrasMap = Record<string, any>

const normalizePath = (p?: string) => {
  if (!p || p === '/') return '/';
  // strip leading slashes then re-add one
  const clean = p.replace(/^\/+/, '');
  return `/${clean}`;
};

const toArray = <T>(m?: T | T[]) => (Array.isArray(m) ? m : m ? [m] : []);

const asyncWrap = (fn: (req: any, res: any, next: any) => any) =>
  <REQ, RES, NEXT>(req: REQ, res: RES, next: NEXT) =>
    Promise.resolve(fn(req, res, next)).catch(next as any);

const makeExtrasMiddleware = (extras: any, name: string, routeExtras?: any) => {
  const incoming = routeExtras ?? {};
  const existing = extras?.[name] ?? {}
  return {
    ...extras,
    [name]: { ...existing, ...incoming }
  };
}


export const DambaRoute = <REQ, RES, NEXT, ROUTER>({ root, sub }: any, _SPS_: IServiceProvider<REQ, RES, NEXT>, AppConfig?: IAppConfig): { route: ROUTER, extras: any } => {
  // const root = express.Router();
  // const sub = express.Router();
  let extras: any = {};
  for (const [serviceMount, serviceComplete] of Object.entries(_SPS_)) {
    // eslint-disable-next-line no-console
    if (AppConfig?.logRoute)
       console.debug('Mount service:', serviceMount);

    const { service, middleware } = serviceComplete as IServiceComplete<REQ, RES, NEXT>;

    for (const [key, value] of Object.entries(service)) {
      if (!value) continue;

      // Key like: "GET@/users" | "POST@users" | "PATCH@/users/:id"
      const [rawMethod, rawPath] = String(key).split('@');
      const method = toHttpEnum(rawMethod);

      if (!method) {
        // eslint-disable-next-line no-console
        if (AppConfig?.logRoute)
          console.warn(`Unknown HTTP verb "${rawMethod}" for route key "${key}" — skipping.`);
        continue;
      }

      const routePath = normalizePath(rawPath); // ensure leading slash
      const name = serviceMount.replace("/", "").toLowerCase();

      extras = makeExtrasMiddleware(extras, name, value.extras);
      const config  = (value as any)?.config as IDActionConfig;
     
      const mws = [...toArray(value.middleware)];
      if (config?.timeout) {
         mws.push((req: REQ, res: RES, next: NEXT) => {
                  (req as any).setTimeout(config.timeout);
                  (res as any).setTimeout(config.timeout);
                  (next as any)();
         });
      }
      const handler = value?.behavior;
     

      // eslint-disable-next-line no-console
      if (AppConfig?.logRoute)
        console.debug(method, ':', `${AppConfig?.base_path}${serviceMount}${routePath}`);

      switch (method) {
        case Http.GET:
          sub.get(routePath, ...mws, handler);
          break;
        case Http.POST:
          sub.post(routePath, ...mws, handler);
          break;
        case Http.DELETE:
          sub.delete(routePath, ...mws, handler);
          break;
        case Http.PUT:
          sub.put(routePath, ...mws, handler);
          break;
        case Http.PATCH:
          sub.patch(routePath, ...mws, handler);
          break;
        default:
          // eslint-disable-next-line no-console
          if (AppConfig?.logRoute)
            console.warn(`Unhandled HTTP method "${method}" for route key "${key}"`);
      }
    }

    // mount service-level middlewares (array or single), then sub-router
    const topLevel = toArray(middleware).map(asyncWrap);
    if (topLevel.length) {
      root.use(serviceMount, ...topLevel, sub);
    } else {
      root.use(serviceMount, sub);
    }
  }

  return { route: root, extras };
};

