/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, Button, Input, Select } from '@/components/ui'
import {
    AgentManifestSchema,
    AgentManifestFormValues,
    defaultManifestValues,
} from '@/validators/agentManifestSchema'
import { useRunnableLambdaStore } from '@/stores/runnableLambdaStore'
import { ToolConfigPanel } from './ToolConfigPanel'

const toolTypeOptions = [
    'tavily_search',
    'qdrant_retriever',
    'http',
    'damba_architecture_read',
    'damba_propose_patch',
    'custom_plugin',
].map((v) => ({ value: v, label: v }))

const entryKindOptions = [
    'simple',
    'multi_step',
    'stateful',
    'router',
    'pipeline',
    'pipeline_no_agent',
    'tool_only',
].map((v) => ({ value: v, label: v }))

const subAgentKindOptions = [
    'simple',
    'multi_step',
    'stateful',
    'rag',
    'tool_only',
    'pipeline_no_agent',
    'pipeline',
].map((v) => ({ value: v, label: v }))

const pipelineStepTypeOptions = [
    'lambda',
    'tool',
    'subAgent',
    'router',
].map((v) => ({ value: v, label: v }))

type Props = {
    initialValues?: AgentManifestFormValues
    onSave: (manifest: AgentManifestFormValues) => Promise<void> | void
    onValidate?: (ok: boolean) => void
}

export default function AgentManifestBuilderForm({
    initialValues,
    onSave,
    onValidate,
}: Props) {
    const form = useForm<AgentManifestFormValues>({
        resolver: zodResolver(AgentManifestSchema),
        defaultValues: initialValues ?? defaultManifestValues,
        mode: 'onChange',
    })

    const { control, register, handleSubmit, watch, formState, setValue } = form
    const entryKind = watch('entry.kind')

    const toolsFA = useFieldArray({ control, name: 'tools' })
    const subAgentsFA = useFieldArray({ control, name: 'subAgents' })
    const runnableLambdasFA = useFieldArray({
        control,
        name: 'runnableLambdas',
    })
    const pipelineStepsFA = useFieldArray({
        control,
        name: 'entry.steps',
    } as any)

    const [draggedStepIndex, setDraggedStepIndex] = useState<number | null>(null)

    const { runnableLambdas, loadRunnableLambdas, loading } =
        useRunnableLambdaStore()

    useEffect(() => {
        loadRunnableLambdas()
    }, [loadRunnableLambdas])

    const toolNames = useMemo(
        () => (watch('tools') ?? []).map((t) => t?.name).filter(Boolean),
        [watch('tools')],
    )

    const toolNameOptions = useMemo(
        () => toolNames.map((n) => ({ value: n, label: n })),
        [toolNames],
    )

    const subAgentIdOptions = useMemo(
        () =>
            (watch('subAgents') ?? [])
                .map((s) => s?.id)
                .filter(Boolean)
                .map((id) => ({ value: id, label: id })),
        [watch('subAgents')],
    )

    const lambdaIdOptions = useMemo(
        () =>
            (watch('runnableLambdas') ?? [])
                .map((l) => l?.id)
                .filter(Boolean)
                .map((id) => ({ value: id, label: id })),
        [watch('runnableLambdas')],
    )

    const runnableLambdaLibraryOptions = useMemo(
        () =>
            (runnableLambdas ?? []).map((x: any) => ({
                value: x.id,
                label: `${x.name} (${x.version ?? '-'})`,
            })),
        [runnableLambdas],
    )

    const submit = handleSubmit(async (values) => {
        await onSave(values)
    })

    const validateNow = async () => {
        const ok = await form.trigger()
        onValidate?.(ok)
    }

    const handleStepDrop = (targetIndex: number) => {
        if (draggedStepIndex == null || draggedStepIndex === targetIndex) return
        pipelineStepsFA.move(draggedStepIndex, targetIndex)
        setDraggedStepIndex(null)
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <Card className="p-4 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-medium">Manifest Builder</h2>
                    <p className="text-sm text-muted-foreground">
                        Build tools + runnable lambdas + sub-agents + routing
                        without editing raw JSON.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="default"
                        onClick={validateNow}
                    >
                        Validate
                    </Button>
                    <Button type="submit" loading={formState.isSubmitting}>
                        Save
                    </Button>
                </div>
            </Card>

            {/* General */}
            <Card className="p-4 rounded-2xl shadow-sm space-y-3">
                <h3 className="font-medium">General</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <label className="text-sm font-medium">Version</label>
                        <Input {...register('version')} />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Model</label>
                        <Input {...register('defaults.model')} />
                    </div>

                    <div>
                        <label className="text-sm font-medium">
                            Temperature
                        </label>
                        <Input
                            type="number"
                            step="0.1"
                            {...register('defaults.temperature', {
                                valueAsNumber: true,
                            })}
                        />
                    </div>

                    <div className="md:col-span-3">
                        <label className="text-sm font-medium">
                            Max output chars
                        </label>
                        <Input
                            type="number"
                            {...register('defaults.maxOutputChars', {
                                valueAsNumber: true,
                            })}
                        />
                    </div>
                </div>
            </Card>

            {/* Entry */}
            <Card className="p-4 rounded-2xl shadow-sm space-y-3">
                <h3 className="font-medium">Entry</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <label className="text-sm font-medium">Kind</label>
                        <Controller
                            control={control}
                            name="entry.kind"
                            render={({ field }) => (
                                <Select
                                    options={entryKindOptions}
                                    value={entryKindOptions.find(
                                        (o) => o.value === field.value,
                                    )}
                                    onChange={(o) => field.onChange(o?.value)}
                                />
                            )}
                        />
                    </div>

                    {entryKind !== 'pipeline' && (
                        <div className="md:col-span-3">
                            <label className="text-sm font-medium">
                                System prompt
                            </label>
                            <Input textArea {...register('entry.systemPrompt')} />
                        </div>
                    )}
                </div>

                {entryKind === 'router' && (
                    <div className="mt-3 space-y-3">
                        <div>
                            <label className="text-sm font-medium">
                                Router prompt
                            </label>
                            <Input
                                textArea
                                placeholder='Return ONLY one word like: "codebase" or "web"'
                                {...register('entry.router.prompt')}
                            />
                        </div>

                        <RouterRoutesEditor
                            control={control}
                            setValue={setValue}
                            watch={watch}
                            subAgentIdOptions={subAgentIdOptions}
                        />
                    </div>
                )}
            </Card>

            {/* Runnable Lambdas */}
            <Card className="p-4 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium">Runnable lambdas registry</h3>
                    <Button
                        type="button"
                        onClick={() =>
                            runnableLambdasFA.append({
                                id: `lambda_${runnableLambdasFA.fields.length + 1}`,
                                runnableLambdaId: '',
                            } as any)
                        }
                    >
                        Add lambda
                    </Button>
                </div>

                {loading && (
                    <p className="text-sm text-muted-foreground">
                        Loading runnable lambdas...
                    </p>
                )}

                <div className="space-y-3">
                    {runnableLambdasFA.fields.map((f, idx) => {
                        const base = `runnableLambdas.${idx}` as const
                        const selectedId = watch(
                            `${base}.runnableLambdaId` as any,
                        )

                        const selectedLambda = (runnableLambdas ?? []).find(
                            (x: any) => x.id === selectedId,
                        )

                        return (
                            <Card
                                key={f.id}
                                className="p-3 border rounded-2xl space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="font-medium">
                                        Runnable Lambda #{idx + 1}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="default"
                                        onClick={() =>
                                            runnableLambdasFA.remove(idx)
                                        }
                                    >
                                        Remove
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm font-medium">
                                            Manifest alias id
                                        </label>
                                        <Input {...register(`${base}.id`)} />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">
                                            Runnable lambda
                                        </label>
                                        <Controller
                                            control={control}
                                            name={`${base}.runnableLambdaId` as any}
                                            render={({ field }) => (
                                                <Select
                                                    options={
                                                        runnableLambdaLibraryOptions
                                                    }
                                                    value={runnableLambdaLibraryOptions.find(
                                                        (o) =>
                                                            o.value ===
                                                            field.value,
                                                    )}
                                                    onChange={(o: any) =>
                                                        field.onChange(o?.value)
                                                    }
                                                    placeholder="Select a runnable lambda"
                                                />
                                            )}
                                        />
                                    </div>
                                </div>

                                {selectedLambda && (
                                    <div className="text-xs text-muted-foreground">
                                        kind: {selectedLambda.kind ?? '-'} •
                                        version: {selectedLambda.version ?? '-'}{' '}
                                        • status: {selectedLambda.status ?? '-'}
                                    </div>
                                )}
                            </Card>
                        )
                    })}
                </div>
            </Card>

            {/* Tools */}
            <Card className="p-4 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium">Tools registry</h3>
                    <Button
                        type="button"
                        onClick={() =>
                            toolsFA.append({
                                name: `tool_${toolsFA.fields.length + 1}`,
                                type: 'http',
                                enabled: true,
                                config: {},
                            } as any)
                        }
                    >
                        Add tool
                    </Button>
                </div>

                <div className="space-y-3">
                    {toolsFA.fields.map((f, idx) => {
                        const base = `tools.${idx}` as const
                        const type = watch(`tools.${idx}.type` as const)

                        return (
                            <Card
                                key={f.id}
                                className="p-3 border rounded-2xl space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="font-medium">
                                        Tool #{idx + 1}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="default"
                                        onClick={() => toolsFA.remove(idx)}
                                    >
                                        Remove
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-sm font-medium">
                                            Name
                                        </label>
                                        <Input {...register(`${base}.name`)} />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">
                                            Type
                                        </label>
                                        <Controller
                                            control={control}
                                            name={`${base}.type` as any}
                                            render={({ field }) => (
                                                <Select
                                                    options={toolTypeOptions}
                                                    value={toolTypeOptions.find(
                                                        (o) =>
                                                            o.value ===
                                                            field.value,
                                                    )}
                                                    onChange={(o) =>
                                                        field.onChange(o?.value)
                                                    }
                                                />
                                            )}
                                        />
                                    </div>

                                    <div className="flex items-end gap-2">
                                        <label className="text-sm font-medium">
                                            Enabled
                                        </label>
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4"
                                            {...register(
                                                `${base}.enabled` as any,
                                            )}
                                            defaultChecked={true}
                                        />
                                    </div>
                                </div>

                                <ToolConfigPanel
                                    toolType={type}
                                    register={register}
                                    idx={idx}
                                    control={control}
                                    watch={watch}
                                    setValue={setValue}
                                />
                            </Card>
                        )
                    })}
                </div>
            </Card>

            {/* SubAgents */}
            <Card className="p-4 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium">Sub-agents</h3>
                    <Button
                        type="button"
                        onClick={() =>
                            subAgentsFA.append({
                                id: `agent_${subAgentsFA.fields.length + 1}`,
                                kind: 'multi_step',
                                systemPrompt: '',
                                tools: [],
                                maxIterations: 8,
                            } as any)
                        }
                    >
                        Add sub-agent
                    </Button>
                </div>

                <div className="space-y-3">
                    {subAgentsFA.fields.map((f, idx) => {
                        const base = `subAgents.${idx}` as const
                        return (
                            <Card
                                key={f.id}
                                className="p-3 border rounded-2xl space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="font-medium">
                                        SubAgent #{idx + 1}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="default"
                                        onClick={() => subAgentsFA.remove(idx)}
                                    >
                                        Remove
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-sm font-medium">
                                            Id
                                        </label>
                                        <Input {...register(`${base}.id`)} />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">
                                            Kind
                                        </label>
                                        <Controller
                                            control={control}
                                            name={`${base}.kind` as any}
                                            render={({ field }) => (
                                                <Select
                                                    options={
                                                        subAgentKindOptions
                                                    }
                                                    value={subAgentKindOptions.find(
                                                        (o) =>
                                                            o.value ===
                                                            field.value,
                                                    )}
                                                    onChange={(o) =>
                                                        field.onChange(o?.value)
                                                    }
                                                />
                                            )}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">
                                            Max iterations
                                        </label>
                                        <Input
                                            type="number"
                                            {...register(
                                                `${base}.maxIterations`,
                                                { valueAsNumber: true },
                                            )}
                                        />
                                    </div>

                                    <div className="md:col-span-3">
                                        <label className="text-sm font-medium">
                                            System prompt
                                        </label>
                                        <Input
                                            textArea
                                            {...register(
                                                `${base}.systemPrompt`,
                                            )}
                                        />
                                    </div>

                                    <div className="md:col-span-3">
                                        <label className="text-sm font-medium">
                                            Allowed tools
                                        </label>
                                        <SubAgentToolsPicker
                                            setValue={setValue}
                                            watch={watch}
                                            idx={idx}
                                            toolNameOptions={toolNameOptions}
                                        />
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            </Card>

            {/* Pipeline steps */}
            {entryKind === 'pipeline' && (
                <Card className="p-4 rounded-2xl shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium">Pipeline steps</h3>
                        <Button
                            type="button"
                            onClick={() =>
                                pipelineStepsFA.append({
                                    type: 'lambda',
                                    lambdaId:
                                        lambdaIdOptions?.[0]?.value ?? '',
                                    name: '',
                                } as any)
                            }
                        >
                            Add step
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {pipelineStepsFA.fields.map((f, idx) => {
                            const base = `entry.steps.${idx}` as const
                            const stepType = watch(
                                `${base}.type` as any,
                            ) as string

                            return (
                                <Card
                                    key={f.id}
                                    draggable
                                    onDragStart={() => setDraggedStepIndex(idx)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleStepDrop(idx)}
                                    onDragEnd={() => setDraggedStepIndex(null)}
                                    className={`p-3 border rounded-2xl space-y-3 cursor-move ${
                                        draggedStepIndex === idx
                                            ? 'opacity-60 border-slate-400'
                                            : ''
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="font-medium flex items-center gap-2">
                                            <span className="text-lg">⋮⋮</span>
                                            <span>Step #{idx + 1}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="default"
                                                onClick={() =>
                                                    idx > 0 &&
                                                    pipelineStepsFA.move(
                                                        idx,
                                                        idx - 1,
                                                    )
                                                }
                                            >
                                                ↑
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="default"
                                                onClick={() =>
                                                    idx <
                                                        pipelineStepsFA.fields.length -
                                                            1 &&
                                                    pipelineStepsFA.move(
                                                        idx,
                                                        idx + 1,
                                                    )
                                                }
                                            >
                                                ↓
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="default"
                                                onClick={() =>
                                                    pipelineStepsFA.remove(idx)
                                                }
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-sm font-medium">
                                                Step type
                                            </label>
                                            <Controller
                                                control={control}
                                                name={`${base}.type` as any}
                                                render={({ field }) => (
                                                    <Select
                                                        options={
                                                            pipelineStepTypeOptions
                                                        }
                                                        value={pipelineStepTypeOptions.find(
                                                            (o) =>
                                                                o.value ===
                                                                field.value,
                                                        )}
                                                        onChange={(o) => {
                                                            const v = o?.value
                                                            field.onChange(v)

                                                            if (v === 'lambda') {
                                                                setValue(
                                                                    `${base}.lambdaId` as any,
                                                                    lambdaIdOptions?.[0]
                                                                        ?.value ??
                                                                        '',
                                                                )
                                                                setValue(
                                                                    `${base}.toolName` as any,
                                                                    undefined,
                                                                )
                                                                setValue(
                                                                    `${base}.subAgentId` as any,
                                                                    undefined,
                                                                )
                                                            }

                                                            if (v === 'tool') {
                                                                setValue(
                                                                    `${base}.toolName` as any,
                                                                    toolNameOptions?.[0]
                                                                        ?.value ??
                                                                        '',
                                                                )
                                                                setValue(
                                                                    `${base}.lambdaId` as any,
                                                                    undefined,
                                                                )
                                                                setValue(
                                                                    `${base}.subAgentId` as any,
                                                                    undefined,
                                                                )
                                                            }

                                                            if (v === 'subAgent') {
                                                                setValue(
                                                                    `${base}.subAgentId` as any,
                                                                    subAgentIdOptions?.[0]
                                                                        ?.value ??
                                                                        '',
                                                                )
                                                                setValue(
                                                                    `${base}.lambdaId` as any,
                                                                    undefined,
                                                                )
                                                                setValue(
                                                                    `${base}.toolName` as any,
                                                                    undefined,
                                                                )
                                                            }

                                                            if (v === 'router') {
                                                                setValue(
                                                                    `${base}.lambdaId` as any,
                                                                    undefined,
                                                                )
                                                                setValue(
                                                                    `${base}.toolName` as any,
                                                                    undefined,
                                                                )
                                                                setValue(
                                                                    `${base}.subAgentId` as any,
                                                                    undefined,
                                                                )
                                                                setValue(
                                                                    `${base}.router.routes` as any,
                                                                    {},
                                                                )
                                                            }
                                                        }}
                                                    />
                                                )}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium">
                                                Name
                                            </label>
                                            <Input {...register(`${base}.name`)} />
                                        </div>
                                    </div>

                                    {stepType === 'lambda' && (
                                        <div>
                                            <label className="text-sm font-medium">
                                                Lambda alias
                                            </label>
                                            <Controller
                                                control={control}
                                                name={`${base}.lambdaId` as any}
                                                render={({ field }) => (
                                                    <Select
                                                        options={lambdaIdOptions}
                                                        value={lambdaIdOptions.find(
                                                            (o) =>
                                                                o.value ===
                                                                field.value,
                                                        )}
                                                        onChange={(o) =>
                                                            field.onChange(
                                                                o?.value,
                                                            )
                                                        }
                                                    />
                                                )}
                                            />
                                        </div>
                                    )}

                                    {stepType === 'tool' && (
                                        <div>
                                            <label className="text-sm font-medium">
                                                Tool name
                                            </label>
                                            <Controller
                                                control={control}
                                                name={`${base}.toolName` as any}
                                                render={({ field }) => (
                                                    <Select
                                                        options={toolNameOptions}
                                                        value={toolNameOptions.find(
                                                            (o) =>
                                                                o.value ===
                                                                field.value,
                                                        )}
                                                        onChange={(o) =>
                                                            field.onChange(
                                                                o?.value,
                                                            )
                                                        }
                                                    />
                                                )}
                                            />
                                        </div>
                                    )}

                                    {stepType === 'subAgent' && (
                                        <div>
                                            <label className="text-sm font-medium">
                                                Sub-agent id
                                            </label>
                                            <Controller
                                                control={control}
                                                name={`${base}.subAgentId` as any}
                                                render={({ field }) => (
                                                    <Select
                                                        options={
                                                            subAgentIdOptions
                                                        }
                                                        value={subAgentIdOptions.find(
                                                            (o) =>
                                                                o.value ===
                                                                field.value,
                                                        )}
                                                        onChange={(o) =>
                                                            field.onChange(
                                                                o?.value,
                                                            )
                                                        }
                                                    />
                                                )}
                                            />
                                        </div>
                                    )}

                                    {stepType === 'router' && (
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium">
                                                    Router prompt
                                                </label>
                                                <Input
                                                    textArea
                                                    {...register(
                                                        `${base}.router.prompt`,
                                                    )}
                                                />
                                            </div>

                                            <RouterRoutesEditor
                                                control={control}
                                                setValue={setValue}
                                                watch={watch}
                                                subAgentIdOptions={
                                                    subAgentIdOptions
                                                }
                                                path={`${base}.router.routes`}
                                            />
                                        </div>
                                    )}
                                </Card>
                            )
                        })}
                    </div>
                </Card>
            )}

            {formState.isSubmitted && !formState.isValid && (
                <Card className="p-4 rounded-2xl shadow-sm border border-red-200">
                    <p className="text-sm text-red-600">
                        Manifest is not valid. Fix the highlighted sections and
                        Validate again.
                    </p>
                </Card>
            )}
        </form>
    )
}

function RouterRoutesEditor({
    control,
    setValue,
    watch,
    subAgentIdOptions,
    path = 'entry.router.routes',
}: any) {
    const routes = (watch(path) ?? {}) as Record<string, string>
    const routeKeys = Object.keys(routes)

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Routes</label>
                <Button
                    type="button"
                    variant="default"
                    onClick={() => {
                        const nextKey = `route_${routeKeys.length + 1}`
                        setValue(
                            `${path}.${nextKey}`,
                            subAgentIdOptions?.[0]?.value ?? '',
                            { shouldDirty: true, shouldValidate: true },
                        )
                    }}
                >
                    Add route
                </Button>
            </div>

            {routeKeys.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    No routes yet.
                </p>
            )}

            <div className="space-y-2">
                {routeKeys.map((k) => (
                    <div
                        key={k}
                        className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center"
                    >
                        <div className="md:col-span-4">
                            <Input value={k} disabled />
                        </div>
                        <div className="md:col-span-6">
                            <Controller
                                control={control}
                                name={`${path}.${k}`}
                                render={({ field }) => (
                                    <Select
                                        options={subAgentIdOptions}
                                        value={
                                            subAgentIdOptions.find(
                                                (o: any) =>
                                                    o.value === field.value,
                                            ) ?? null
                                        }
                                        onChange={(o: any) =>
                                            field.onChange(o?.value)
                                        }
                                    />
                                )}
                            />
                        </div>
                        <div className="md:col-span-2 text-right">
                            <Button
                                type="button"
                                variant="default"
                                onClick={() => {
                                    const current = { ...routes }
                                    delete current[k]
                                    setValue(path, current, {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                    })
                                }}
                            >
                                Remove
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function SubAgentToolsPicker({
    watch,
    setValue,
    idx,
    toolNameOptions,
}: any) {
    const name = `subAgents.${idx}.tools`
    const current: string[] = watch(name) ?? []

    const addTool = (toolName: string) => {
        if (!toolName) return
        if (current.includes(toolName)) return
        setValue(name, [...current, toolName], {
            shouldDirty: true,
            shouldValidate: true,
        })
    }

    const removeTool = (toolName: string) => {
        setValue(
            name,
            current.filter((t) => t !== toolName),
            { shouldDirty: true, shouldValidate: true },
        )
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-2 items-center">
                <Select
                    options={toolNameOptions}
                    onChange={(o: any) => addTool(o?.value)}
                    placeholder="Add a tool"
                />
            </div>

            {current.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    No tools selected.
                </p>
            )}

            <div className="flex flex-wrap gap-2">
                {current.map((t) => (
                    <span
                        key={t}
                        className="px-2 py-1 rounded-full bg-gray-100 text-sm flex items-center gap-2"
                    >
                        {t}
                        <button
                            type="button"
                            className="text-red-500"
                            onClick={() => removeTool(t)}
                        >
                            ✕
                        </button>
                    </span>
                ))}
            </div>
        </div>
    )
}