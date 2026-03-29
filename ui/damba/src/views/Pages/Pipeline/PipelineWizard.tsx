/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import classNames from 'classnames'
import {
    HiCheck,
    HiExclamation,
    HiOutlineArrowRight,
    HiOutlineRefresh,
} from 'react-icons/hi'

import Steps from '@/components/ui/Steps'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { useSocket } from '@/providers/SocketProvider'
import { useProjectStore } from '@/stores/useProjectStore'
import {
    usePipelineStore,
    PIPELINE_STEPS,
    PipelineStepId,
    selectCurrentStep,
    selectCurrentStepState,
} from '@/stores/usePipelineStore'
import { SocketAction } from '../../../../../../common/Damba/core/Socket'

import {
    StepProjectApps,
    StepEntities,
    StepServices,
    StepBehaviors,
    StepMiddlewaresPolicies,
    StepGeneric,
} from './steps'

// ─── Step → socket event name mapping ───────────────────────────────────────

const stepEventName = (stepId: PipelineStepId) =>
    `socket:${SocketAction.pipeline(stepId)}`

// ─── Step content renderer ──────────────────────────────────────────────────

const StepContent = ({ stepId }: { stepId: PipelineStepId }) => {
    switch (stepId) {
        case PipelineStepId.PROJECT_AND_APPS:
            return <StepProjectApps />
        case PipelineStepId.ENTITIES:
            return <StepEntities />
        case PipelineStepId.MODULES:
            return <StepServices />
        case PipelineStepId.VALIDATORS:
            return (
                <StepGeneric
                    stepId={stepId}
                    title="Validators"
                    dataKey="validators"
                />
            )
        case PipelineStepId.MIDDLEWARES_POLICIES:
            return <StepMiddlewaresPolicies />
        case PipelineStepId.BEHAVIORS_EXTRAS:
            return <StepBehaviors />
        case PipelineStepId.APP_FILES:
            return <StepGeneric stepId={stepId} title="Files" dataKey="files" />
        case PipelineStepId.DAMBA_COMMON:
            return (
                <div className="text-center py-8">
                    <HiCheck className="mx-auto text-4xl text-green-500 mb-2" />
                    <p className="text-lg font-semibold">Project Complete</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        All framework files have been loaded.
                    </p>
                </div>
            )
        default:
            return <p className="text-gray-500">Unknown step</p>
    }
}

export const PipelineWizardBase = () => {
    const navigate = useNavigate()
    const { sendAsync, socket: socketInstance, isConnected } = useSocket()
    const addProject = useProjectStore((s) => s.addProject)
    const updateProject = useProjectStore((s) => s.updateProject)
    const setProject = useProjectStore((s) => s.setProject)

    const {
        active,
        prompt,
        projectId,
        currentStepIndex,
        steps,
        setProjectId,
        setStepRunning,
        setStepProgress,
        setStepCompleted,
        setStepFailed,
        advanceToNext,
        reset,
    } = usePipelineStore()

    const currentStep = usePipelineStore(selectCurrentStep)
    const currentStepState = usePipelineStore(selectCurrentStepState)
    const listenersRef = useRef<Set<string>>(new Set())

    // ── Socket event listeners for progress/complete/failed ──────────────

    const attachListeners = useCallback(
        (stepId: PipelineStepId, jobId: string) => {
            if (
                !socketInstance ||
                listenersRef.current.has(`${stepId}:${jobId}`)
            )
                return
            listenersRef.current.add(`${stepId}:${jobId}`)

            const progressEvent = `progress:pipeline:${stepId}:${jobId}`
            const completeEvent = `complete:pipeline:${stepId}:${jobId}`
            const failedEvent = `failed:pipeline:${stepId}:${jobId}`

            socketInstance.on(progressEvent, (payload: any) => {
                setStepProgress(
                    stepId,
                    payload.pct ?? 0,
                    payload.message ?? '',
                    payload.data,
                )
            })

            socketInstance.on(completeEvent, (payload: any) => {
                const resultData = payload?.data ?? payload
                setStepCompleted(stepId, resultData)
                // Capture projectId from any step that returns it
                const pid = payload?.projectId ?? resultData?.projectId
                if (pid) {
                    setProjectId(pid)
                    // Update project in store with latest step info
                    const stepLabel = PIPELINE_STEPS.find(
                        (s) => s.id === stepId,
                    )?.label
                    updateProject({
                        id: pid,
                        lastCompletedStep: stepLabel,
                        buildStatus: 'in_progress',
                    } as any)
                }
                // If step 1, add project to store
                if (
                    stepId === PipelineStepId.PROJECT_AND_APPS &&
                    (resultData?.project ?? payload?.data?.project)
                ) {
                    addProject(resultData?.project ?? payload?.data?.project)
                }
                // Cleanup
                socketInstance.off(progressEvent)
                socketInstance.off(completeEvent)
                socketInstance.off(failedEvent)
            })

            socketInstance.on(failedEvent, (payload: any) => {
                setStepFailed(
                    stepId,
                    payload?.error ?? payload?.message ?? 'Step failed',
                )
                socketInstance.off(progressEvent)
                socketInstance.off(completeEvent)
                socketInstance.off(failedEvent)
            })
        },
        [
            socketInstance,
            setStepProgress,
            setStepCompleted,
            setStepFailed,
            setProjectId,
            addProject,
            updateProject,
        ],
    )

    // ── Trigger a step ──────────────────────────────────────────────────

    const runStep = useCallback(
        async (stepId: PipelineStepId) => {
            if (!isConnected) return

            const eventName = stepEventName(stepId)
            const payload: any = { prompt }
            if (projectId) payload.projectId = projectId

            try {
                const resp = await sendAsync(eventName, payload, {
                    timeoutMs: 30000,
                })
                if (!resp?.ok) {
                    setStepFailed(stepId, resp?.error ?? 'Request failed')
                    return
                }
                const jobId = resp?.data?.jobId
                if (jobId) {
                    setStepRunning(stepId, jobId)
                    attachListeners(stepId, jobId)
                }
            } catch (err: any) {
                setStepFailed(stepId, err?.message ?? 'Request error')
            }
        },
        [
            isConnected,
            sendAsync,
            prompt,
            projectId,
            setStepRunning,
            setStepFailed,
            attachListeners,
        ],
    )

    // ── Auto-run current step on mount if it's pending ────────────────

    useEffect(() => {
        if (!active) return
        const step = PIPELINE_STEPS[currentStepIndex]
        if (step && steps[step.id].status === 'pending') {
            runStep(step.id)
        }
    }, [active]) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Cleanup on unmount ──────────────────────────────────────────────

    useEffect(() => {
        return () => {
            listenersRef.current.clear()
        }
    }, [])

    // ── Handlers ────────────────────────────────────────────────────────

    const handleValidateAndContinue = () => {
        if (!currentStep) return
        const nextIndex = currentStepIndex + 1
        advanceToNext()

        if (nextIndex < PIPELINE_STEPS.length) {
            const nextStepId = PIPELINE_STEPS[nextIndex].id
            runStep(nextStepId)
        }
    }

    const handleRetry = () => {
        if (!currentStep) return
        runStep(currentStep.id)
    }

    const handleFinish = () => {
        if (projectId) {
            setProject(projectId)
        }
        reset()
        navigate('/projects')
    }

    // ── Redirect if no active pipeline ──────────────────────────────────

    if (!active) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No active pipeline. Start by creating a project.
                </p>
                <Button variant="solid" onClick={() => navigate('/home')}>
                    Go Home
                </Button>
            </div>
        )
    }

    // ── Determine step status for the Steps component ───────────────────

    const mapStatus = (
        s: string,
    ): 'complete' | 'pending' | 'in-progress' | 'error' => {
        if (s === 'running') return 'in-progress'
        if (s === 'completed' || s === 'validating') return 'complete'
        if (s === 'failed') return 'error'
        return 'pending'
    }

    const isLastStep = currentStepIndex === PIPELINE_STEPS.length - 1
    const isDone =
        isLastStep &&
        (currentStepState?.status === 'completed' ||
            currentStepState?.status === 'validating')

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900 overflow-y-auto">
            <div className=" w-full mx-auto p-4 md:p-6 flex-1 flex flex-col">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-xl font-bold">Project Pipeline</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                        Prompt: <span className="italic">"{prompt}"</span>
                    </p>
                </div>

                {/* Steps indicator */}
                <div className="mb-8 overflow-x-auto">
                    <Steps
                        current={currentStepIndex}
                        status={mapStatus(
                            currentStepState?.status ?? 'pending',
                        )}
                    >
                        {PIPELINE_STEPS.map((step) => (
                            <Steps.Item key={step.id} title={step.label} />
                        ))}
                    </Steps>
                </div>

                {/* Current step status bar */}
                {currentStepState && currentStepState.status === 'running' && (
                    <div className="mb-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                {currentStepState.message ?? 'Processing...'}
                            </span>
                            <span className="text-xs text-blue-500">
                                {currentStepState.pct ?? 0}%
                            </span>
                        </div>
                        <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5">
                            <div
                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                style={{
                                    width: `${currentStepState.pct ?? 0}%`,
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Error bar */}
                {currentStepState?.status === 'failed' && (
                    <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-3 flex items-center gap-3">
                        <HiExclamation className="text-red-500 text-xl flex-shrink-0" />
                        <span className="text-sm text-red-700 dark:text-red-300 flex-1">
                            {currentStepState.error ?? 'An error occurred'}
                        </span>
                        <Button
                            size="xs"
                            variant="solid"
                            color="red-600"
                            onClick={handleRetry}
                        >
                            <HiOutlineRefresh className="mr-1" /> Retry
                        </Button>
                    </div>
                )}

                {/* Step content */}
                <div className="min-h-[200px] mb-6 flex-1 overflow-y-auto">
                    {currentStepState?.status === 'running' ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <Spinner size={40} />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {currentStepState.message ?? 'Processing...'}
                            </p>
                        </div>
                    ) : (
                        currentStep && <StepContent stepId={currentStep.id} />
                    )}
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
                            <Button variant="solid" onClick={handleFinish}>
                                Go to Project
                            </Button>
                        ) : (
                            <Button
                                variant="solid"
                                disabled={
                                    currentStepState?.status !== 'validating'
                                }
                                onClick={handleValidateAndContinue}
                            >
                                Validate & Continue
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const PipelineWizard = () => {
    return <PipelineWizardBase />
}

export default PipelineWizard
