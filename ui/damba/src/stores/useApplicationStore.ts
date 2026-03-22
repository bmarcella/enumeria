import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { Application } from '../../../../common/Damba/v2/Entity/project'

type AppState = {
    applications: Application[]
    applicationId: string
    env: string
    cApp?: Application
}

type AppActions = {
    setApplications: (apps: Application[]) => void
    setApplicationById: (id: string) => void
    setApplication: (app: Application) => void
    setEnv: (env: string) => void
    reset: () => void
}

const initial: AppState = {
    applications: [],
    applicationId: '',
    cApp: undefined,
    env: 'dev',
}

export const useApplicationStore = create<AppState & AppActions>()(
    subscribeWithSelector(
        persist(
            (set, get) => ({
                ...initial,
                setApplications: (applications) => {
                    set({ applications })
                    const { applicationId } = get()
                    const exists = applications.some(
                        (a) =>
                            a.id === applicationId || a.name === applicationId,
                    )
                    if (!exists) set({ applicationId: '' })
                },
                setApplicationById: (applicationId) => set({ applicationId }),
                setApplication: (cApp) => set({ cApp }),
                setEnv: (env: string) => set({ env }),
                reset: () =>
                    set({
                        ...initial,
                    }),
            }),
            {
                name: 'damba.application.selection.v1',
                partialize: (s) => ({
                    applicationId: s.applicationId,
                    cApp: s.cApp,
                    env: s.env,
                }),
            },
        ),
    ),
)
