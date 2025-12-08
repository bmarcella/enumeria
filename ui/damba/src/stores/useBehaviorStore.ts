/* eslint-disable @typescript-eslint/no-explicit-any */
import { Behavior } from '../../../../common/Entity/behavior'
import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'

type BehaviorState = {
    behaviors: Behavior[]
    behavior?: Behavior
}

type BehaviorActions = {
    setBehaviors: (items: Behavior[]) => void
    setBehavior: (b?: Behavior) => void
    upsertBehavior: (b: Behavior) => void
    removeBehavior: (id: string) => void
    clearSelection: () => void
    reset: () => void
}

const initial: BehaviorState = {
    behaviors: [],
    behavior: undefined,
}

/* ------------------------------ Helpers ------------------------------ */

const behaviorKey = (b?: Behavior) =>
    b ? (b.id ?? `${b.method}@${b.path}@${b.name}`) : undefined

const sameIdentity = (a?: Behavior, b?: Behavior) => {
    const ka = behaviorKey(a)
    const kb = behaviorKey(b)
    return !!ka && ka === kb
}

const findByIdentity = (list: Behavior[], probe: Behavior | string) => {
    const key = typeof probe === 'string' ? probe : behaviorKey(probe)
    if (!key) return undefined
    return list.find((b) => behaviorKey(b) === key)
}

/* -------------------------------- Store -------------------------------- */

export const useBehaviorStore = create<BehaviorState & BehaviorActions>()(
    subscribeWithSelector(
        persist(
            (set, get) => ({
                ...initial,

                setBehaviors: (behaviors) => {
                    set({ behaviors })

                    // reconcile selected behavior with refreshed list
                    const current = get().behavior
                    if (!current) return
                    const match = findByIdentity(behaviors, current)
                    if (!match) set({ behavior: undefined })
                    else if (!sameIdentity(match, current) || match !== current)
                        set({ behavior: match })
                },

                setBehavior: (behavior) => set({ behavior }),

                upsertBehavior: (b) => {
                    set((s) => {
                        const key = behaviorKey(b)
                        if (!key) return s
                        const idx = s.behaviors.findIndex(
                            (x) => behaviorKey(x) === key,
                        )
                        const next = [...s.behaviors]
                        if (idx >= 0) next[idx] = { ...next[idx], ...b }
                        else next.unshift(b)

                        const selected = s.behavior
                        const nextSelected =
                            selected && behaviorKey(selected) === key
                                ? ({ ...selected, ...b } as Behavior)
                                : selected

                        return { behaviors: next, behavior: nextSelected }
                    })
                },

                removeBehavior: (id) => {
                    set((s) => {
                        const next = s.behaviors.filter((b) => b.id !== id)
                        const selected =
                            s.behavior?.id === id ? undefined : s.behavior
                        return { behaviors: next, behavior: selected }
                    })
                },

                clearSelection: () => set({ behavior: undefined }),

                reset: () => set({ ...initial }),
            }),
            {
                name: 'damba.behavior.selection.v1',
                // keep storage light: store only identity for selection
                partialize: (s) =>
                    ({
                        behaviorIdentity: s.behavior
                            ? behaviorKey(s.behavior)
                            : undefined,
                    }) as any,
                onRehydrateStorage: () => () => {
                    // no-op: setBehaviors() will reconcile selection once behaviors are loaded
                },
            },
        ),
    ),
)

/* ------------------------------ Selectors ------------------------------ */

export const selectBehaviors = (s: BehaviorState) => s.behaviors
export const selectBehavior = (s: BehaviorState) => s.behavior
