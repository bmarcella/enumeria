/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { NextFunction, Request, Response, Router } from 'express'
import { Http, IServiceComplete, IServiceProvider, toHttpEnum } from '../service/DambaService'
import { ErrorMessage } from '../../../../common/error/error'
import { AppConfig } from '../../config/app'

export type ExtrasMap = Record<string, (...args: any[]) => any>


const normalizePath = (p?: string) => {
  if (!p || p === '/') return '/'
  // strip leading slashes then re-add one
  const clean = p.replace(/^\/+/, '')
  return `/${clean}`
}

const toArray = <T>(m?: T | T[]) => (Array.isArray(m) ? m : m ? [m] : [])

const asyncWrap =
  (fn: (req: Request, res: Response, next: NextFunction) => any) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next)

const makeExtrasMiddleware = (name: string, routeExtras?: ExtrasMap, ) =>
  (req: Request, res: Response, next: NextFunction) => {
    const incoming =  routeExtras  ?? {}
    const existing = req.extras[name] ?? {}

    // compute duplicate keys (intersection)
    const duplicates = Object.keys(incoming).filter((k) => k in existing)
    if (duplicates.length > 0) {
      return res.status(500).send({
        error: ErrorMessage.SAME_EXTRA_NAME,
        duplicateKeys: duplicates,
      })
    }

    req.extras = { ...existing, "",...incoming }
    next()
  }

/**
 * Mounts the service provider into a router at:
 *   `${AppConfig.base_path}${serviceMount}${routePath}`
 */
export const DambaRoute = (_SPS_: IServiceProvider<Request, Response, NextFunction>): Router => {
  const root = express.Router()

  for (const [serviceMount, serviceComplete] of Object.entries(_SPS_)) {
    // eslint-disable-next-line no-console
    console.log('Mount service:', serviceMount)

    const { service, middleware } = serviceComplete as IServiceComplete<Request, Response, NextFunction>
    const sub = express.Router()

    for (const [key, value] of Object.entries(service)) {
      if (!value) continue

      // Key like: "GET@/users" | "POST@users" | "PATCH@/users/:id"
      const [rawMethod, rawPath] = String(key).split('@')
      const method = toHttpEnum(rawMethod)
      if (!method) {
        // eslint-disable-next-line no-console
        console.warn(`Unknown HTTP verb "${rawMethod}" for route key "${key}" — skipping.`)
        continue
      }

      const routePath = normalizePath(rawPath) // ensure leading slash
      const name = serviceMount.replace("/", "").toLowerCase(); 
      const extrasMw = makeExtrasMiddleware(name, value.extras)
      const mws = [...toArray(value.middleware), extrasMw];
      const handler = value?.behavior;

      // eslint-disable-next-line no-console
      console.log(method, ':', `${AppConfig.base_path}${serviceMount}${routePath}`)

      switch (method) {
        case Http.GET:
          sub.get(routePath, ...mws, handler)
          break
        case Http.POST:
          sub.post(routePath, ...mws, handler)
          break
        case Http.DELETE:
          sub.delete(routePath, ...mws, handler)
          break
        case Http.PUT:
          sub.put(routePath, ...mws, handler)
          break
        case Http.PATCH:
          sub.patch(routePath, ...mws, handler)
          break
        default:
          // eslint-disable-next-line no-console
          console.warn(`Unhandled HTTP method "${method}" for route key "${key}"`)
      }
    }

    // mount service-level middlewares (array or single), then sub-router
    const topLevel = toArray(middleware).map(asyncWrap)
    if (topLevel.length) {
      root.use(serviceMount, ...topLevel, sub)
    } else {
      root.use(serviceMount, sub)
    }
  }

  return root
}
