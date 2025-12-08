/* eslint-disable @typescript-eslint/no-unused-vars */
// providers/BehaviorProvider.tsx
import React, { useEffect } from 'react'
import { useBehaviorStore } from '@/stores/useBehaviorStore'
import { Behavior } from '../../../../common/Entity/behavior'

type Props = {
    children: React.ReactNode
    autoSelectSingle?: boolean
    fetchBehaviors: () => Promise<Behavior[]>
}

export function BehaviorProvider({
    children,
    autoSelectSingle = true,
    fetchBehaviors,
}: Props) {
    const setBehaviors = useBehaviorStore((s) => s.setBehaviors)
    const behaviors = useBehaviorStore((s) => s.behaviors)
    const behavior = useBehaviorStore((s) => s.behavior)
    const setBehavior = useBehaviorStore((s) => s.setBehavior)

    useEffect(() => {
        let cancelled = false

        async function init() {
            const list = await fetchBehaviors()
            if (cancelled) return

            setBehaviors(list ?? [])

            if (autoSelectSingle && (list?.length ?? 0) === 1 && !behavior) {
                setBehavior(list[0])
            }
        }

        init()
        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchBehaviors])

    return <>{children}</>
}
