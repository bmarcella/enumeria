/* eslint-disable @typescript-eslint/no-explicit-any */
import { IAppConfig } from "@Damba/v2/config/IAppConfig";
import {
  Http,
  IDActionConfig,
  IModule,
  IServiceComplete,
  SocketEventHandlerChain,
} from "../service/IServiceDamba";
import { toHttpEnum } from "@Damba/v2/service/DambaHelper";
import {
  normalizePath,
  makeExtrasMiddleware,
  toArray,
  asyncWrap,
  addZodValidator,
} from "./IRoute";

export const DambaRoute = <REQ, RES, NEXT, ROUTER>(
  { root, express }: any,
  modules: IModule<REQ, RES, NEXT>[],
  AppConfig?: IAppConfig<any>,
): { route: ROUTER; extras: any; events: any } => {
  let extras: any = {};
  let all_events: SocketEventHandlerChain = {};

  for (const mod of modules) {
    // Module-level middleware (applied to every service in this module)
    const moduleMws = toArray(mod.middleware).map(asyncWrap);

    for (const [serviceMount, serviceComplete] of Object.entries(mod.services)) {
      const sub = express.Router();
      // eslint-disable-next-line no-console
      if (AppConfig?.logRoute)
        console.debug(
          `Mount service: ${serviceMount} (module: ${mod.name})`,
        );

      const { service, middleware, events, rootExtras } =
        serviceComplete as IServiceComplete<REQ, RES, NEXT>;
      const name = serviceMount.replace("/", "").toLowerCase();

      if (rootExtras) {
        extras = makeExtrasMiddleware(extras, name, rootExtras);
      }

      all_events = { ...all_events, ...events };

      for (const [key, value] of Object.entries(service)) {
        if (!value) continue;

        // Key like: "GET@/users" | "POST@users" | "PATCH@/users/:id"
        const [rawMethod, rawPath] = String(key).split("@");
        const method = toHttpEnum(rawMethod);

        if (!method) {
          // eslint-disable-next-line no-console
          if (AppConfig?.logRoute)
            console.warn(
              `Unknown HTTP verb "${rawMethod}" for route key "${key}" — skipping.`,
            );
          continue;
        }
        const routePath = normalizePath(rawPath); // ensure leading slash

        extras = makeExtrasMiddleware(extras, name, value.extras);
        const config = (value as any)?.config as IDActionConfig;
        const mws = [...toArray(value.middleware)];
        // timeouts
        if (config?.timeout) {
          mws.push((req: any, res: any, next: any) => {
            if ((config.timeout as any)?.in)
              req.setTimeout((config.timeout as any).in);
            if ((config.timeout as any)?.out)
              res.setTimeout((config.timeout as any).out);
            return next();
          });
        }

        //validators (Zod-style)
        if (config?.validators) {
          addZodValidator(mws, "body", config.validators.body);
          addZodValidator(mws, "params", config.validators.params);
          addZodValidator(mws, "query", config.validators.query);
        }

        // eslint-disable-next-line no-console
        if (AppConfig?.logRoute) {
          console.debug(
            method,
            ":",
            `${AppConfig?.path.basic}${serviceMount}${routePath}`,
          );
        }

        const handlers = Array.isArray(value.behavior)
          ? value.behavior
          : [value.behavior];

        switch (method) {
          case Http.GET:
            sub.get(routePath, ...mws, ...handlers);
            break;
          case Http.POST:
            sub.post(routePath, ...mws, ...handlers);
            break;
          case Http.DELETE:
            sub.delete(routePath, ...mws, ...handlers);
            break;
          case Http.PUT:
            sub.put(routePath, ...mws, ...handlers);
            break;
          case Http.PATCH:
            sub.patch(routePath, ...mws, ...handlers);
            break;
          default:
            // eslint-disable-next-line no-console
            if (AppConfig?.logRoute)
              console.warn(
                `Unhandled HTTP method "${method}" for route key "${key}"`,
              );
        }
      }

      // Mount order: module middleware → service middleware → sub-router
      const serviceMws = toArray(middleware).map(asyncWrap);
      const allMws = [...moduleMws, ...serviceMws];

      if (allMws.length) {
        root.use(serviceMount, ...allMws, sub);
      } else {
        root.use(serviceMount, sub);
      }
    }
  }
  return { route: root, extras, events: all_events };
};
