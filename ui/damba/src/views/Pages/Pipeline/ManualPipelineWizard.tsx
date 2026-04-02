import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
    useManualPipelineStore,
    MANUAL_PIPELINE_STEPS,
    ManualStepId,
    selectCurrentManualStep,
    selectIsLastStep,
} from '@/stores/useManualPipelineStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useApplicationStore } from '@/stores/useApplicationStore'
import { updateProjectStep } from '@/services/Project'
import Steps from '@/components/ui/Steps'
import Button from '@/components/ui/Button'
import {
    ManualStepEntities,
    ManualStepModules,
    ManualStepServices,
    ManualStepBehaviors,
    ManualStepExtras,
    ManualStepFinalize,
} from './manual-steps'

const StepContent = ({ stepId }: { stepId: ManualStepId }) => {
    switch (stepId) {
        case ManualStepId.ENTITIES:
            return <ManualStepEntities />
        case ManualStepId.MODULES:
            return <ManualStepModules />
        case ManualStepId.SERVICES:
            return <ManualStepServices />
        case ManualStepId.BEHAVIORS:
            return <ManualStepBehaviors />
        case ManualStepId.EXTRAS:
            return <ManualStepExtras />
        case ManualStepId.FINALIZE:
            return <ManualStepFinalize />
        default:
            return <p className="text-gray-500">Unknown step</p>
    }
}

const APP_TYPE_LABELS: Record<string, string> = {
    api: 'API',
    microservice: 'Microservice',
    ui: 'UI',
    web: 'Web',
    mobile: 'Mobile',
    cli: 'CLI',
    library: 'Library',
    daemon: 'Daemon',
    workers: 'Workers',
    packages: 'Packages',
    'package-entities': 'Database',
    'package-validators': 'Validators',
    'package-policies-middlewares': 'Policies',
}

const ManualPipelineWizard = () => {
    const navigate = useNavigate()
    const setProject = useProjectStore((s) => s.setProject)
    const setApplicationStoreApp = useApplicationStore((s) => s.setApplication)

    const {
        active,
        projectId,
        currentStepIndex,
        steps,
        apps,
        currentAppId,
        setCurrentApp,
        advanceToNext,
        skipStep,
        reset,
    } = useManualPipelineStore()

    // Sync selected app to useApplicationStore so steps can use cApp
    useEffect(() => {
        const app = apps.find((a) => a.id === currentAppId)
        if (app) setApplicationStoreApp(app as any)
    }, [currentAppId, apps, setApplicationStoreApp])

    const currentStep = useManualPipelineStore(selectCurrentManualStep)
    const isLastStep = useManualPipelineStore(selectIsLastStep)
    const isDone =
        isLastStep &&
        (steps[ManualStepId.FINALIZE]?.status === 'completed' ||
            steps[ManualStepId.FINALIZE]?.status === 'active')

    const [saving, setSaving] = useState(false)

    const mapStatus = (
        s: string,
    ): 'complete' | 'pending' | 'in-progress' | 'error' => {
        if (s === 'active') return 'in-progress'
        if (s === 'completed' || s === 'skipped') return 'complete'
        return 'pending'
    }

    const persistStep = async (stepId: string, buildStatus?: string) => {
        if (!projectId) return
        try {
            await updateProjectStep(projectId, { step: stepId, buildStatus })
        } catch (err) {
            console.error('Failed to persist step', err)
        }
    }

    const handleNext = async () => {
        if (!currentStep || saving) return
        setSaving(true)
        await persistStep(currentStep.id, 'in_progress')
        advanceToNext()
        setSaving(false)
    }

    const handleSkip = async () => {
        if (!currentStep || saving) return
        setSaving(true)
        await persistStep(currentStep.id, 'in_progress')
        skipStep()
        setSaving(false)
    }

    const handleFinish = async () => {
        setSaving(true)
        await persistStep('finalize', 'completed')
        if (projectId) {
            setProject(projectId)
        }
        reset()
        setSaving(false)
        navigate('/workspace')
    }

    if (!active) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No active manual pipeline. Start by creating a project.
                </p>
                <Button variant="solid" onClick={() => navigate('/home')}>
                    Go Home
                </Button>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900 overflow-y-auto">
            <div className="w-full mx-auto p-4 md:p-6 flex-1 flex flex-col">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-xl font-bold dark:text-white">
                        Manual Project Setup
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Configure your project structure step by step
                    </p>
                </div>

                {/* App selector */}
                {apps.length > 0 && (
                    <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1">
                        {apps.map((app) => {
                            const isActive = app.id === currentAppId
                            return (
                                <button
                                    key={app.id}
                                    onClick={() => setCurrentApp(app.id)}
                                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                                        isActive
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                                >
                                    {app.name}
                                    <span className={`ml-1.5 text-[10px] ${isActive ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
                                        {APP_TYPE_LABELS[app.type_app] ?? app.type_app}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                )}

                {/* Steps indicator */}
                <div className="mb-8 overflow-x-auto">
                    <Steps
                        current={currentStepIndex}
                        status={mapStatus(
                            currentStep
                                ? steps[currentStep.id]?.status ?? 'pending'
                                : 'pending',
                        )}
                    >
                        {MANUAL_PIPELINE_STEPS.map((step) => (
                            <Steps.Item key={step.id} title={step.label} />
                        ))}
                    </Steps>
                </div>

                {/* Step content */}
                <div className="min-h-[200px] mb-6 flex-1 overflow-y-auto">
                    {currentStep && <StepContent stepId={currentStep.id} />}
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4 mt-auto">
                    <Button
                        variant="plain"
                        onClick={() => {
                            reset()
                            navigate('/home')
                        }}
                    >
                        Cancel
                    </Button>

                    <div className="flex gap-3">
                        {isDone ? (
                            <Button
                                variant="solid"
                                loading={saving}
                                onClick={handleFinish}
                            >
                                Go to Workspace
                            </Button>
                        ) : (
                            <>
                                {!isLastStep && (
                                    <Button
                                        variant="plain"
                                        disabled={saving}
                                        onClick={handleSkip}
                                    >
                                        Skip
                                    </Button>
                                )}
                                <Button
                                    variant="solid"
                                    loading={saving}
                                    onClick={
                                        isLastStep
                                            ? handleFinish
                                            : handleNext
                                    }
                                >
                                    {isLastStep
                                        ? 'Go to Workspace'
                                        : 'Save & Continue'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ManualPipelineWizard
