import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'

export enum ManualStepId {
    ENTITIES = 'entities',
    MODULES = 'modules',
    SERVICES = 'services',
    BEHAVIORS = 'behaviors',
    EXTRAS = 'extras',
    FINALIZE = 'finalize',
}

export const MANUAL_PIPELINE_STEPS: { id: ManualStepId; label: string }[] = [
    { id: ManualStepId.ENTITIES, label: 'Entities' },
    { id: ManualStepId.MODULES, label: 'Modules' },
    { id: ManualStepId.SERVICES, label: 'Services' },
    { id: ManualStepId.BEHAVIORS, label: 'Behaviors' },
    { id: ManualStepId.EXTRAS, label: 'Extras' },
    { id: ManualStepId.FINALIZE, label: 'Finalize' },
]

export type ManualStepStatus = 'pending' | 'active' | 'completed' | 'skipped'

type ManualStepState = {
    status: ManualStepStatus
}

export type PipelineApp = {
    id: string
    name: string
    type_app: string
}

type ManualPipelineState = {
    active: boolean
    projectId: string
    hasBackendApp: boolean
    currentStepIndex: number
    steps: Record<ManualStepId, ManualStepState>
    apps: PipelineApp[]
    currentAppId: string
}

type ManualPipelineActions = {
    startManualPipeline: (projectId: string, hasBackendApp: boolean, apps?: PipelineApp[]) => void
    setCurrentApp: (appId: string) => void
    advanceToNext: () => void
    skipStep: () => void
    goToStep: (index: number) => void
    reset: () => void
}

const makeInitialSteps = (): Record<ManualStepId, ManualStepState> => {
    const steps: Record<string, ManualStepState> = {}
    for (const s of MANUAL_PIPELINE_STEPS) {
        steps[s.id] = { status: 'pending' }
    }
    return steps as Record<ManualStepId, ManualStepState>
}

const initial: ManualPipelineState = {
    active: false,
    projectId: '',
    hasBackendApp: true,
    currentStepIndex: 0,
    steps: makeInitialSteps(),
    apps: [],
    currentAppId: '',
}

export const useManualPipelineStore = create<
    ManualPipelineState & ManualPipelineActions
>()(
    subscribeWithSelector(
        persist(
            (set, get) => ({
                ...initial,

                startManualPipeline: (projectId, hasBackendApp, apps) => {
                    const steps = makeInitialSteps()
                    // If no backend app, skip to finalize
                    const startIndex = hasBackendApp ? 0 : MANUAL_PIPELINE_STEPS.length - 1
                    steps[MANUAL_PIPELINE_STEPS[startIndex].id] = { status: 'active' }
                    const pipelineApps = (apps ?? []).map((a: any) => ({
                        id: a.id,
                        name: a.name,
                        type_app: a.type_app,
                    }))
                    const backendApp = pipelineApps.find((a) =>
                        ['api', 'microservice', 'daemon', 'workers'].includes(a.type_app),
                    )
                    set({
                        ...initial,
                        active: true,
                        projectId,
                        hasBackendApp,
                        currentStepIndex: startIndex,
                        steps,
                        apps: pipelineApps,
                        currentAppId: backendApp?.id ?? pipelineApps[0]?.id ?? '',
                    })
                },

                setCurrentApp: (appId) => set({ currentAppId: appId }),

                advanceToNext: () => {
                    const { currentStepIndex, steps } = get()
                    const currentStep = MANUAL_PIPELINE_STEPS[currentStepIndex]
                    if (!currentStep) return

                    const s = { ...steps }
                    s[currentStep.id] = { status: 'completed' }

                    const nextIndex = currentStepIndex + 1
                    if (nextIndex < MANUAL_PIPELINE_STEPS.length) {
                        s[MANUAL_PIPELINE_STEPS[nextIndex].id] = { status: 'active' }
                        set({ steps: s, currentStepIndex: nextIndex })
                    } else {
                        set({ steps: s })
                    }
                },

                skipStep: () => {
                    const { currentStepIndex, steps } = get()
                    const currentStep = MANUAL_PIPELINE_STEPS[currentStepIndex]
                    if (!currentStep) return

                    const s = { ...steps }
                    s[currentStep.id] = { status: 'skipped' }

                    const nextIndex = currentStepIndex + 1
                    if (nextIndex < MANUAL_PIPELINE_STEPS.length) {
                        s[MANUAL_PIPELINE_STEPS[nextIndex].id] = { status: 'active' }
                        set({ steps: s, currentStepIndex: nextIndex })
                    } else {
                        set({ steps: s })
                    }
                },

                goToStep: (index) => {
                    const { steps } = get()
                    const s = { ...steps }
                    s[MANUAL_PIPELINE_STEPS[index].id] = { status: 'active' }
                    set({ steps: s, currentStepIndex: index })
                },

                reset: () => set({ ...initial, steps: makeInitialSteps() }),
            }),
            {
                name: 'damba.manual-pipeline.v1',
                partialize: (s) => ({
                    active: s.active,
                    projectId: s.projectId,
                    hasBackendApp: s.hasBackendApp,
                    currentStepIndex: s.currentStepIndex,
                    steps: s.steps,
                    apps: s.apps,
                    currentAppId: s.currentAppId,
                }),
            },
        ),
    ),
)

export const selectCurrentManualStep = (s: ManualPipelineState) =>
    MANUAL_PIPELINE_STEPS[s.currentStepIndex]

export const selectIsLastStep = (s: ManualPipelineState) =>
    s.currentStepIndex === MANUAL_PIPELINE_STEPS.length - 1
