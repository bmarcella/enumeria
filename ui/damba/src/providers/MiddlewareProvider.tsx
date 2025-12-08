// providers/MiddlewareProvider.tsx
import React, { useEffect } from 'react'
import { useMiddlewareStore } from '@/stores/useMiddlewareStore'
import { Middleware } from '../../../../common/Entity/behavior'

type Props = {
    children: React.ReactNode
    autoSelectSingle?: boolean
    fetchMiddlewares: () => Promise<Middleware[]>
}

export function MiddlewareProvider({
    children,
    autoSelectSingle = true,
    fetchMiddlewares,
}: Props) {
    const setMiddlewares = useMiddlewareStore((s) => s.setMiddlewares)
    const middleware = useMiddlewareStore((s) => s.middleware)
    const setMiddleware = useMiddlewareStore((s) => s.setMiddleware)

    useEffect(() => {
        let cancelled = false

        async function init() {
            const list = await fetchMiddlewares()
            if (cancelled) return

            setMiddlewares(list ?? [])

            if (autoSelectSingle && (list?.length ?? 0) === 1 && !middleware) {
                setMiddleware(list[0])
            }
        }

        init()
        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchMiddlewares])

    return <>{children}</>
}
