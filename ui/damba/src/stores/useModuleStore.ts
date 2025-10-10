/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// stores/useModuleStore.ts
import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { AppModule } from '../../../../common/Entity/project'

type ModuleState = {
  // scope
  userId?: string
  orgId?: string
  projectId?: string
  applicationId?: string

  // data
  modules: AppModule[]
  module?: AppModule            // <-- store the object, not just the id
}

type ModuleActions = {
  setScope: (userId?: string, orgId?: string, projectId?: string, applicationId?: string) => void
  setModules: (mods: AppModule[]) => void
  setModule: (mod?: AppModule) => void
  reset: () => void
}

const initial: ModuleState = {
  userId: undefined,
  orgId: undefined,
  projectId: undefined,
  applicationId: undefined,
  modules: [],
  module: undefined,
}

export const useModuleStore = create<ModuleState & ModuleActions>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initial,

        setScope: (userId, orgId, projectId, applicationId) => {
          const g = get()
          const changed =
            g.userId !== userId ||
            g.orgId !== orgId ||
            g.projectId !== projectId ||
            g.applicationId !== applicationId

          if (changed) {
            set({ ...initial, userId, orgId, projectId, applicationId })
          } else {
            set({ userId, orgId, projectId, applicationId })
          }
        },

        setModules: (modules) => {
          set({ modules })

          // Reconcile the selected module object with the new list
          const current = get().module
          if (!current) return

          const match = findByIdentity(modules, current)
          if (!match) {
            // selected module no longer valid in this scope
            set({ module: undefined })
          } else if (match !== current) {
            // refresh the reference to the canonical object
            set({ module: match })
          }
        },

        setModule: (mod) => set({ module: mod }),

        reset: () =>
          set({
            ...initial,
            userId: get().userId,
            orgId: get().orgId,
            projectId: get().projectId,
            applicationId: get().applicationId,
          }),
      }),
      {
        name: 'damba.module.selection.v2',
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
          moduleIdentity: s.module ? (s.module.id ?? s.module.name) : undefined,
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
export const selectModules = (s: ModuleState) => s.modules
export const selectModule  = (s: ModuleState) => s.module

/* ------------------------------ Utilities ------------------------------ */
function moduleKey(m: AppModule | undefined) {
  return m ? (m.id ?? m.name) : undefined
}

function sameIdentity(a?: AppModule, b?: AppModule) {
  return a && b && moduleKey(a) === moduleKey(b)
}

function findByIdentity(list: AppModule[], probe: AppModule | string) {
  const key = typeof probe === 'string' ? probe : moduleKey(probe)
  return list.find(m => (m.id ?? m.name) === key)
}
