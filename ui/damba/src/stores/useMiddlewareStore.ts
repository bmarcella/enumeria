import { Middleware } from '../../../../common/Entity/behavior'
/* eslint-disable @typescript-eslint/no-explicit-any */
// stores/useMiddlewareStore.ts
import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'

type MiddlewareState = {
    middlewares: Middleware[]
    middleware?: Middleware
}

type MiddlewareActions = {
    setMiddlewares: (list: Middleware[]) => void
    setMiddleware: (m?: Middleware) => void
    reset: () => void
}

const initial: MiddlewareState = {
    middlewares: [],
    middleware: undefined,
}

const keyOf = (m?: Middleware) => (m ? (m.id ?? m.name) : undefined)

export const useMiddlewareStore = create<MiddlewareState & MiddlewareActions>()(
    subscribeWithSelector(
        persist(
            (set, get) => ({
                ...initial,

                setMiddlewares: (middlewares) => {
                    set({ middlewares })

                    // reconcile selected middleware with new list
                    const current = get().middleware
                    if (!current) return

                    const key = keyOf(current)
                    const match = middlewares.find(
                        (x) => (x.id ?? x.name) === key,
                    )
                    if (!match) set({ middleware: undefined })
                    else if (match !== current) set({ middleware: match })
                },

                setMiddleware: (middleware) => set({ middleware }),

                reset: () => set({ ...initial }),
            }),
            {
                name: 'damba.middleware.selection.v1',
                partialize: (s) =>
                    ({
                        // persist only identity, not whole object
                        middlewareIdentity: s.middleware
                            ? (s.middleware.id ?? s.middleware.name)
                            : undefined,
                    }) as any,
            },
        ),
    ),
)

/* Selectors (optional) */
export const selectMiddlewares = (s: MiddlewareState) => s.middlewares
export const selectMiddleware = (s: MiddlewareState) => s.middleware
