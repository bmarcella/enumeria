/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { CanvasBox } from '../../../../common/Entity/CanvasBox'

type EntityState = {
  // data
  entities: CanvasBox[]
  entity?: CanvasBox
}

type EntityActions = {
  setEntities: (entities: CanvasBox[]) => void
  setEntity: (entity?: CanvasBox) => void
  reset: () => void
}

const initial: EntityState = {
  entities: [],
  entity: undefined,
}

export const useEntityStore = create<EntityState & EntityActions>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initial,

        setEntities: (entities) => {
          set({ entities })

          const current = get().entity
          if (!current) return

          const match = findByIdentity(entities, current)
          if (!match) {
            set({ entity: undefined })
          } else if (match !== current) {
            set({ entity: match })
          }
        },

        setEntity: (entity) => set({ entity }),

        reset: () =>
          set({
            ...initial,
          }),
      }),
      {
        name: 'damba.entity.selection.v1',
        partialize: (s) =>
          ({
            entityIdentity: s.entity ? (s.entity.id ?? s.entity.entityName) : undefined,
          }) as any,
         onRehydrateStorage: () => (_state) => {
          // setEntities will reconcile entity from entityIdentity
        },
      }
    )
  )
)

/* ------------------------------ Selectors ------------------------------ */

export const selectEntities = (s: EntityState) => s.entities
export const selectEntity = (s: EntityState) => s.entity

/* ------------------------------ Utilities ------------------------------ */

function entityKey(e: CanvasBox | undefined) {
  return e ? (e.id ?? e.entityName) : undefined
}

function findByIdentity(list: CanvasBox[], probe: CanvasBox | string) {
  const key = typeof probe === 'string' ? probe : entityKey(probe)
  return list.find((e) => (e.id ?? e.entityName) === key)
}
