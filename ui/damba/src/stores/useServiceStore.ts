/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// stores/useModuleStore.ts
import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import {  Service } from '../../../../common/Entity/project'

type ServiceState = {
  // scope
  userId?: string
  orgId?: string
  projectId?: string
  applicationId?: string
  moduleId?: string
  // data
  services: Service[]
  service?: Service            // <-- store the object, not just the id
}

type ServiceActions = {
  setScope: (userId?: string, orgId?: string, projectId?: string, applicationId?: string, moduleId?: string) => void
  setServices: (mods: Service[]) => void
  setService: (mod?: Service) => void
  reset: () => void
}

const initial: ServiceState = {
  userId: undefined,
  orgId: undefined,
  projectId: undefined,
  applicationId: undefined,
  services: [],
  service: undefined,
}

export const useServiceStore = create<ServiceState & ServiceActions>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initial,
        setScope: (userId, orgId, projectId, applicationId, moduleId) => {
          const g = get()
          const changed =
            g.userId !== userId ||
            g.orgId !== orgId ||
            g.projectId !== projectId ||
            g.applicationId !== applicationId ||
            g.moduleId !== moduleId

          if (changed) {
            set({ ...initial, userId, orgId, projectId, applicationId, moduleId })
          } else {
            set({ userId, orgId, projectId, applicationId, moduleId })
          }
        },

        setServices: (services) => {
          set({ services })

          // Reconcile the selected module object with the new list
          const current = get().service
          if (!current) return

          const match = findByIdentity(services, current)
          if (!match) {
            // selected module no longer valid in this scope
            set({ service: undefined })
          } else if (match !== current) {
            // refresh the reference to the canonical object
            set({ service: match })
          }
        },

        setService: (mod) => set({ service: mod }),

        reset: () =>
          set({
            ...initial,
            userId: get().userId,
            orgId: get().orgId,
            projectId: get().projectId,
            applicationId: get().applicationId,
            moduleId: get().moduleId
          }),
      }),
      {
        name: 'damba.service.selection.v2',
        /**
         * Persist only a lightweight identifier for the selected module.
         * On rehydrate, we’ll materialize it from the next setModules() call.
         */
        partialize: (s) => ({
          userId: s.userId,
          orgId: s.orgId,
          projectId: s.projectId,
          applicationId: s.applicationId,
          // store only identity to avoid bloating storage with big objects
          moduleIdentity: s.service ? (s.service.id ?? s.service.name) : undefined,
        }) as any,
        // Rehydrate hook to map moduleIdentity back into state shape
        onRehydrateStorage: () => (state) => {
          // nothing to do here; setModules() will reconcile module using identity
        },
      }
    )
  )
)

/* ------------------------------ Selectors ------------------------------ */
export const selectModules = (s: ServiceState) => s.services
export const selectModule  = (s: ServiceState) => s.service

/* ------------------------------ Utilities ------------------------------ */
function moduleKey(m: Service | undefined) {
  return m ? (m.id ?? m.name) : undefined
}

function sameIdentity(a?: Service, b?: Service) {
  return a && b && moduleKey(a) === moduleKey(b)
}

function findByIdentity(list: Service[], probe: Service | string) {
  const key = typeof probe === 'string' ? probe : moduleKey(probe)
  return list.find(m => (m.id ?? m.name) === key)
}
