import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { Application } from '../../../../common/Entity/project'

type AppState = {
  userId?: string
  orgId?: string
  projectId?: string
  applications: Application[]
  applicationId: string,
  cApp?: Application,
}

type AppActions = {
  setScope: (userId?: string, orgId?: string, projectId?: string) => void
  setApplications: (apps: Application[]) => void
  setApplicationById: (id: string) => void
  setApplication: (app: Application) => void
  reset: () => void
}

const initial: AppState = {
  userId: undefined,
  orgId: undefined,
  projectId: undefined,
  applications: [],
  applicationId: '',
  cApp: undefined
}

export const useApplicationStore = create<AppState & AppActions>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initial,

        setScope: (userId, orgId, projectId) => {
          const changed =
            get().userId !== userId ||
            get().orgId !== orgId ||
            get().projectId !== projectId
          if (changed) set({ ...initial, userId, orgId, projectId })
        },

        setApplications: (applications) => {
          set({ applications })
          const { applicationId } = get()
          const exists = applications.some(
            (a) => a.id === applicationId || a.name === applicationId,
          )
          if (!exists) set({ applicationId: '' })
        },
        setApplicationById: (applicationId) => set({ applicationId }),
        setApplication: (cApp) => set({ cApp }),
        reset: () => set({ ...initial, userId: get().userId, orgId: get().orgId, projectId: get().projectId }),
      }),
      {
        name: 'damba.application.selection.v1',
        partialize: (s) => ({
          userId: s.userId,
          orgId: s.orgId,
          projectId: s.projectId,
          applicationId: s.applicationId,
          cApp: s.cApp
        }),
      },
    ),
  ),
)
