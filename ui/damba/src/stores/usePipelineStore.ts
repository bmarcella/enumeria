import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'

export enum PipelineStepId {
  PROJECT_AND_APPS = 'project_and_apps',
  ENTITIES = 'entities',
  MODULES = 'modules',
  SERVICES = 'services',
  VALIDATORS = 'validators',
  MIDDLEWARES_POLICIES = 'middlewares_policies',
  BEHAVIORS_EXTRAS = 'behaviors_extras',
  APP_FILES = 'app_files',
  DAMBA_COMMON = 'damba_common',
}

export const PIPELINE_STEPS: { id: PipelineStepId; label: string }[] = [
  { id: PipelineStepId.PROJECT_AND_APPS, label: 'Project & Apps' },
  { id: PipelineStepId.ENTITIES, label: 'Entities' },
  { id: PipelineStepId.MODULES, label: 'Modules & Services' },
  { id: PipelineStepId.BEHAVIORS_EXTRAS, label: 'Behaviors' },
  { id: PipelineStepId.APP_FILES, label: 'App Files' },
  { id: PipelineStepId.DAMBA_COMMON, label: 'Finalize' },
]

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'validating'

export type StepState = {
  status: StepStatus
  data: any
  error?: string
  jobId?: string
  pct?: number
  message?: string
}

type PipelineState = {
  active: boolean
  projectId: string
  prompt: string
  currentStepIndex: number
  steps: Record<PipelineStepId, StepState>
}

type PipelineActions = {
  startPipeline: (prompt: string) => void
  /** Resume an existing project's pipeline at a given step index */
  resumePipeline: (projectId: string, prompt: string, resumeAtIndex: number) => void
  setProjectId: (id: string) => void
  setStepRunning: (stepId: PipelineStepId, jobId: string) => void
  setStepProgress: (stepId: PipelineStepId, pct: number, message: string, data?: any) => void
  setStepCompleted: (stepId: PipelineStepId, data: any) => void
  setStepFailed: (stepId: PipelineStepId, error: string) => void
  setStepValidating: (stepId: PipelineStepId) => void
  advanceToNext: () => void
  reset: () => void
}

const makeInitialSteps = (): Record<PipelineStepId, StepState> => {
  const steps: any = {}
  for (const s of PIPELINE_STEPS) {
    steps[s.id] = { status: 'pending' as StepStatus, data: null }
  }
  return steps
}

const initial: PipelineState = {
  active: false,
  projectId: '',
  prompt: '',
  currentStepIndex: 0,
  steps: makeInitialSteps(),
}

export const usePipelineStore = create<PipelineState & PipelineActions>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
    ...initial,

    startPipeline: (prompt) => {
      set({ ...initial, active: true, prompt, steps: makeInitialSteps() })
    },

    resumePipeline: (projectId, prompt, resumeAtIndex) => {
      const steps = makeInitialSteps()
      // Mark all steps before resumeAtIndex as completed
      for (let i = 0; i < resumeAtIndex && i < PIPELINE_STEPS.length; i++) {
        steps[PIPELINE_STEPS[i].id] = { status: 'completed', data: null }
      }
      set({
        ...initial,
        active: true,
        projectId,
        prompt,
        currentStepIndex: resumeAtIndex,
        steps,
      })
    },

    setProjectId: (id) => set({ projectId: id }),

    setStepRunning: (stepId, jobId) => {
      const steps = { ...get().steps }
      steps[stepId] = { ...steps[stepId], status: 'running', jobId, pct: 0, message: 'Starting...' }
      set({ steps })
    },

    setStepProgress: (stepId, pct, message, data) => {
      const steps = { ...get().steps }
      steps[stepId] = {
        ...steps[stepId],
        pct,
        message,
        ...(data !== undefined ? { data } : {}),
      }
      set({ steps })
    },

    setStepCompleted: (stepId, data) => {
      const steps = { ...get().steps }
      steps[stepId] = { ...steps[stepId], status: 'validating', data, pct: 100, message: 'Complete — review below' }
      set({ steps })
    },

    setStepFailed: (stepId, error) => {
      const steps = { ...get().steps }
      steps[stepId] = { ...steps[stepId], status: 'failed', error }
      set({ steps })
    },

    setStepValidating: (stepId) => {
      const steps = { ...get().steps }
      steps[stepId] = { ...steps[stepId], status: 'validating' }
      set({ steps })
    },

    advanceToNext: () => {
      const { currentStepIndex, steps } = get()
      const currentStep = PIPELINE_STEPS[currentStepIndex]
      if (currentStep) {
        const s = { ...steps }
        s[currentStep.id] = { ...s[currentStep.id], status: 'completed' }
        const nextIndex = Math.min(currentStepIndex + 1, PIPELINE_STEPS.length - 1)
        set({ steps: s, currentStepIndex: nextIndex })
      }
    },

    reset: () => set({ ...initial, steps: makeInitialSteps() }),
  }),
      {
        name: 'damba.pipeline.v1',
        partialize: (s) => ({
          active: s.active,
          projectId: s.projectId,
          prompt: s.prompt,
          currentStepIndex: s.currentStepIndex,
          steps: s.steps,
        }),
      },
    ),
  ),
)

/**
 * Given a project's buildStatus and lastCompletedStep, determine which
 * pipeline step index to resume at. Returns -1 if completed or unknown.
 */
export const getResumeStepIndex = (buildStatus?: string, lastCompletedStep?: string): number => {
  if (buildStatus === 'completed') return -1

  // Map CreateProjectStep values → next pipeline step index
  // Steps: 0=Project&Apps, 1=Entities, 2=Modules&Services, 3=Behaviors, 4=AppFiles, 5=Finalize
  const stepMap: Record<string, number> = {
    'Project created': 0,
    'Applications generated': 1,
    'Entities generated': 2,
    'Modules generated': 2,                 // still in modules step
    'Services generated': 3,                // modules&services done → behaviors
    'Global validators generated': 3,
    'Global middlewares generated': 3,
    'Behaviors & Extras generated': 4,
    'App files generated': 5,
    'Damba common files loaded': -1,
    'Done': -1,
  }

  if (lastCompletedStep && lastCompletedStep in stepMap) {
    return stepMap[lastCompletedStep]
  }

  // If in_progress but no lastCompletedStep, start from step 1 (apps already exist)
  if (buildStatus === 'in_progress' || buildStatus === 'initializing') return 1

  return 0
}

/** Returns a 0–100 completion percentage for an incomplete project */
export const getCompletionPercent = (buildStatus?: string, lastCompletedStep?: string): number => {
  if (buildStatus === 'completed') return 100
  if (buildStatus === 'failed') {
    // Use lastCompletedStep if available, otherwise estimate from status
    const resumeAt = getResumeStepIndex(buildStatus, lastCompletedStep)
    if (resumeAt > 0) return Math.round((resumeAt / PIPELINE_STEPS.length) * 100)
    return 5
  }
  if (lastCompletedStep) {
    const resumeAt = getResumeStepIndex(buildStatus, lastCompletedStep)
    if (resumeAt > 0) return Math.round((resumeAt / PIPELINE_STEPS.length) * 100)
  }
  // Fallback: map buildStatus to rough percentage
  if (buildStatus === 'initializing') return 5
  if (buildStatus === 'in_progress' || buildStatus === 'pending') return 10
  return 0
}

// Selectors
export const selectCurrentStep = (s: PipelineState) => PIPELINE_STEPS[s.currentStepIndex]
export const selectCurrentStepState = (s: PipelineState) => {
  const step = PIPELINE_STEPS[s.currentStepIndex]
  return step ? s.steps[step.id] : undefined
}
export const selectStepState = (stepId: PipelineStepId) => (s: PipelineState) => s.steps[stepId]
