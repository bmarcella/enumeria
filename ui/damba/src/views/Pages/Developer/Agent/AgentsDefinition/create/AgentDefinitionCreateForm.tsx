/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Checkbox, Input, Select, Spinner, Card } from '@/components/ui'
import {
    AgentRoleTypeEnum,
    AgentColorEnum,
    AgentExecutionModeEnum,
    ScopeTypeEnum,
    CreateAgentDefinitionForm,
    CreateAgentDefinitionFormSchema,
} from '@/validators/SchemaAgentDefinition'
import { Section } from '@/components/Section'
import { Field } from '@/components/Field'
import { CollapsSection } from '@/components/CollapsSection'
import { fetchRunnableLambdas } from '@/services/agents/runnableLambda'
import { parseJsonObjectOrNull } from '@/validators/toolArtifactsSchema'
import ToolArtifactJsonSchemaEditor from '@/views/Pages/Developer/FormUtil/ToolArtifactJsonSchemaEditor'


// ----------------------
// Form Component
// ----------------------

const roleOptions = AgentRoleTypeEnum.options.map((o) => ({
    value: o,
    label: o,
}))
const colorOptions = AgentColorEnum.options.map((o) => ({ value: o, label: o }))
const execOptions = AgentExecutionModeEnum.options.map((o) => ({
    value: o,
    label: o,
}))
const scopeOptions = ScopeTypeEnum.options.map((o) => ({ value: o, label: o }))

function parseCsvToArray(v?: string): string[] {
    return (v ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
}

type RunnableLambdaOption = {
    id: string
    name: string
    version?: string
    kind?: string
    status?: string
}

export function AgentDefinitionCreateForm({
    onSubmit,
    submitting,
}: {
    onSubmit: (payload: any) => Promise<void>
    submitting?: boolean
}) {
    const [loadingRunnableLambdas, setLoadingRunnableLambdas] = useState(false)
    const [runnableLambdaOptions, setRunnableLambdaOptions] = useState<RunnableLambdaOption[]>([])

    const methods = useForm<CreateAgentDefinitionForm>({
        resolver: zodResolver(CreateAgentDefinitionFormSchema),
        defaultValues: {
            name: 'Basic Ai',
            description: 'test',
            roleType: 'Developer',
            emoji: '🤖',
            color: 'Blue',
            version: '0.1.0',
            executionMode: 'studio',
            scopes: ['project'],
            capabilities: ['analyze'],
            permissionsRequested: ['architecture.read'],
            inputsSchema: null,
            agentManifest: undefined,
            runnableLambdas: [], // ✅ NEW
        },
        mode: 'onBlur',
    })

    const {
        control,
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = methods

    const scopes = useWatch({ control, name: 'scopes' }) || []
    const runnableLambdas = useWatch({ control, name: 'runnableLambdas' }) || []

    useEffect(() => {
        const load = async () => {
            try {
                setLoadingRunnableLambdas(true);
                const res = await fetchRunnableLambdas()
                const rows = res?.runnableLambdas ?? res?.data?.runnableLambdas ?? res ?? []

                const normalized = (rows || []).map((x: any) => ({
                    id: x.id,
                    name: x.name,
                    version: x.version,
                    kind: x.kind,
                    status: x.status,
                }))

                setRunnableLambdaOptions(normalized)
            } finally {
                setLoadingRunnableLambdas(false)
            }
        }

        load()
    }, [])

    const selectedRunnableLambdaIds = useMemo(
        () => new Set((runnableLambdas || []).map((x: any) => x.runnableLambdaId)),
        [runnableLambdas]
    )

    const submitHandler = handleSubmit(async (values) => {
        const runnableLambdaRefs =
            (values.runnableLambdas ?? []).map((x, index) => ({
                id: x.id || `lambda_${index + 1}`,
                runnableLambdaId: x.runnableLambdaId,
            }))

        const payload = {
            name: values.name,
            description: values.description,
            roleType: values.roleType,
            emoji: values.emoji,
            color: values.color,
            version: values.version,
            executionMode: values.executionMode,
            scopes: values.scopes,
            capabilities: values.capabilities,
            permissionsRequested: values.permissionsRequested,
            inputsSchema: parseJsonObjectOrNull(values.inputsSchema),
            agentManifest: {
                version: '1',
                entry: {
                    kind: 'pipeline',
                    steps: runnableLambdaRefs.map((x) => ({
                        type: 'lambda',
                        lambdaId: x.id,
                    })),
                },
                runnableLambdas: runnableLambdaRefs,
                tools: [],
                subAgents: [],
                defaults: {
                    model: 'gpt-4o-mini',
                    temperature: 0.2,
                    maxOutputChars: 12000,
                },
            },
        }

        await onSubmit(payload)
    })

    return (
        <FormProvider {...methods}>
            <form onSubmit={submitHandler} className="space-y-4">
                <Section title="Basics">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Field label="Name" errors={{ key: 'name', data: errors }}>
                            <Input
                                {...register('name')}
                                placeholder="e.g. Code Reviewer Agent"
                            />
                        </Field>

                        <Field label="Version" errors={{ key: 'version', data: errors }}>
                            <Input {...register('version')} placeholder="0.1.0" />
                        </Field>

                        <Field label="Emoji" errors={{ key: 'emoji', data: errors }}>
                            <Input {...register('emoji')} placeholder="🤖" />
                        </Field>

                        <Field label="Role type" errors={{ key: 'roleType', data: errors }}>
                            <Controller
                                control={control}
                                name="roleType"
                                render={({ field }) => (
                                    <Select
                                        options={roleOptions}
                                        value={roleOptions.find((o) => o.value === field.value)}
                                        onChange={(opt: any) => field.onChange(opt?.value)}
                                    />
                                )}
                            />
                        </Field>

                        <Field label="Color" errors={{ key: 'color', data: errors }}>
                            <Controller
                                control={control}
                                name="color"
                                render={({ field }) => (
                                    <Select
                                        options={colorOptions}
                                        value={colorOptions.find((o) => o.value === field.value)}
                                        onChange={(opt: any) => field.onChange(opt?.value)}
                                    />
                                )}
                            />
                        </Field>

                        <Field
                            label="Execution mode"
                            errors={{ key: 'executionMode', data: errors }}
                        >
                            <Controller
                                control={control}
                                name="executionMode"
                                render={({ field }) => (
                                    <Select
                                        options={execOptions}
                                        value={execOptions.find((o) => o.value === field.value)}
                                        onChange={(opt: any) => field.onChange(opt?.value)}
                                    />
                                )}
                            />
                        </Field>
                    </div>

                    <Field
                        label="Description"
                        errors={{ key: 'description', data: errors }}
                    >
                        <Input
                            textArea
                            rows={4}
                            {...register('description')}
                            placeholder="What does this agent do? When should we use it?"
                        />
                    </Field>
                </Section>

                <CollapsSection
                    title="Scopes, Capabilities & Permissions"
                    defaultOpen={true}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field
                            label="Scopes (where this agent can attach)"
                            errors={{ key: 'scopes', data: errors }}
                        >
                            <div className="grid grid-cols-2 gap-2">
                                {scopeOptions.map((s) => {
                                    const checked = scopes.includes(s.value as any)
                                    return (
                                        <button
                                            key={s.value}
                                            type="button"
                                            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                                                checked
                                                    ? 'border-slate-900 bg-slate-900 text-white'
                                                    : 'border-gray-200'
                                            }`}
                                            onClick={() => {
                                                const next = checked
                                                    ? scopes.filter((x: any) => x !== s.value)
                                                    : [...scopes, s.value]
                                                setValue('scopes', next as any, {
                                                    shouldDirty: true,
                                                })
                                            }}
                                        >
                                            <Checkbox checked={checked} onChange={() => {}} />
                                            <span>{s.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </Field>

                        <div className="space-y-3">
                            <Field
                                label="Capabilities (CSV)"
                                errors={{ key: 'capabilities', data: errors }}
                            >
                                <Input
                                    placeholder="e.g. analyze, proposeDiff, summarize"
                                    onChange={(e: any) =>
                                        setValue(
                                            'capabilities',
                                            parseCsvToArray(e.target.value),
                                            { shouldDirty: true }
                                        )
                                    }
                                />
                                <div className="text-xs text-muted-foreground">
                                    Comma-separated list.
                                </div>
                            </Field>

                            <Field
                                label="Permissions requested (CSV)"
                                errors={{
                                    key: 'permissionsRequested',
                                    data: errors,
                                }}
                            >
                                <Input
                                    placeholder="e.g. architecture.read, architecture.proposeChanges"
                                    onChange={(e: any) =>
                                        setValue(
                                            'permissionsRequested',
                                            parseCsvToArray(e.target.value),
                                            { shouldDirty: true }
                                        )
                                    }
                                />
                                <div className="text-xs text-muted-foreground">
                                    Comma-separated list.
                                </div>
                            </Field>
                        </div>
                    </div>
                </CollapsSection>

                <CollapsSection title="Inputs" defaultOpen={true}>
    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <Field
            label="Inputs schema (optional JSON)"
            errors={{ key: 'inputsSchema', data: errors }}
        >
            <ToolArtifactJsonSchemaEditor
                control={control}
                form={methods}
                name="inputsSchema"
                label="Inputs schema"
                height={260}
                helperText="Stored as JSONB. Optional."
                errorText={
                    errors.inputsSchema?.message
                        ? String(errors.inputsSchema.message)
                        : undefined
                }
                        template={`{
        "type": "object",
        "properties": {
            "strictMode": { "type": "boolean" }
        }
        }`}
            />
        </Field>
    </div>
</CollapsSection>

                {/* ✅ NEW: Runnable Lambdas */}
                <CollapsSection title="Runnable Lambdas" defaultOpen={true}>
                    <Field
                        label="Select reusable runnable lambdas"
                        errors={{ key: 'runnableLambdas', data: errors }}
                    >
                        <div className="space-y-3">
                            {loadingRunnableLambdas && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Spinner />
                                    Loading runnable lambdas...
                                </div>
                            )}

                            {!loadingRunnableLambdas &&
                                runnableLambdaOptions.length === 0 && (
                                    <div className="text-sm text-muted-foreground">
                                        No runnable lambdas found.
                                    </div>
                                )}

                            {!loadingRunnableLambdas &&
                                runnableLambdaOptions.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {runnableLambdaOptions.map((lambda) => {
                                            const checked = selectedRunnableLambdaIds.has(lambda.id)

                                            return (
                                                <Card
                                                    key={lambda.id}
                                                    className={`p-3 rounded-xl border cursor-pointer ${
                                                        checked
                                                            ? 'border-slate-900 bg-slate-50'
                                                            : 'border-gray-200'
                                                    }`}
                                                    onClick={() => {
                                                        const current = runnableLambdas ?? []

                                                        if (checked) {
                                                            setValue(
                                                                'runnableLambdas',
                                                                current.filter(
                                                                    (x: any) =>
                                                                        x.runnableLambdaId !== lambda.id
                                                                ),
                                                                { shouldDirty: true }
                                                            )
                                                            return
                                                        }

                                                        setValue(
                                                            'runnableLambdas',
                                                            [
                                                                ...current,
                                                                {
                                                                    id: lambda.name
                                                                        .toLowerCase()
                                                                        .replace(/\s+/g, '_')
                                                                        .replace(/[^a-z0-9_]/g, ''),
                                                                    runnableLambdaId: lambda.id,
                                                                },
                                                            ],
                                                            { shouldDirty: true }
                                                        )
                                                    }}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <Checkbox checked={checked} onChange={() => {}} />
                                                        <div className="min-w-0">
                                                            <div className="font-medium">
                                                                {lambda.name}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                version: {lambda.version ?? '-'} • kind:{' '}
                                                                {lambda.kind ?? '-'} • status:{' '}
                                                                {lambda.status ?? '-'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            )
                                        })}
                                    </div>
                                )}

                            <div className="text-xs text-muted-foreground">
                                Selected lambdas will be added to the generated
                                pipeline manifest.
                            </div>
                        </div>
                    </Field>
                </CollapsSection>

                <div className="flex items-center justify-end gap-3">
                    <Button
                        type="submit"
                        variant="default"
                        disabled={!!submitting}
                    >
                        {submitting ? (
                            <span className="inline-flex items-center gap-2">
                                <Spinner />
                                Creating...
                            </span>
                        ) : (
                            'Create Draft Agent'
                        )}
                    </Button>
                </div>
            </form>
        </FormProvider>
    )
}