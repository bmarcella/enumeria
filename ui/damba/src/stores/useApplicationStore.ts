import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { Application } from '../../../../common/Damba/v2/Entity/project'
import { DambaEnvironmentType } from '../../../../common/Damba/v2/Entity/env'

type AppState = {
    applications: Application[]
    applicationId: string
    env?: DambaEnvironmentType
    cApp?: Application
}

type AppActions = {
    setApplications: (apps: Application[]) => void
    setApplicationById: (id: string) => void
    setApplication: (app: Application) => void
    setEnv: (env: DambaEnvironmentType) => void
    reset: () => void
}

const initial: AppState = {
    applications: [],
    applicationId: '',
    cApp: undefined,
    env: undefined,
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
                setEnv: (env: DambaEnvironmentType) => set({ env }),
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
