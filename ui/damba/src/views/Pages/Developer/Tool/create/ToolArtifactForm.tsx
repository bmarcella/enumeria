/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import {
    Controller,
    useFieldArray,
    useForm,
    type FieldErrors,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, Button, Input, Select } from '@/components/ui'
import {
    parseJsonObjectOrNull,
    ToolArtifactFormSchema,
    ToolArtifactFormValues,
} from '@/validators/toolArtifactsSchema'
import ToolArtifactCodeEditor from '../../FormUtil/ToolArtifactCodeEditor'
import ToolArtifactJsonSchemaEditor from '../../FormUtil/ToolArtifactJsonSchemaEditor'
import JsonSchemaBuilder from '../../FormUtil/JsonSchemaBuilder'

const runtimeOptions = ['node_vm', 'container', 'wasm'].map((v) => ({
    value: v,
    label: v,
}))
const sourceOptions = ['inline_code', 'artifact_ref'].map((v) => ({
    value: v,
    label: v,
}))

const statusOptions = [
    'draft',
    'submitted',
    'approved',
    'rejected',
    'delisted',
].map((v) => ({ value: v, label: v }))

function flattenErrors(
    errors: FieldErrors,
    prefix = '',
): { path: string; message: string }[] {
    const out: { path: string; message: string }[] = []
    for (const [key, val] of Object.entries(errors ?? {})) {
        const path = prefix ? `${prefix}.${key}` : key
        if (!val) continue

        const maybeMsg = (val as any).message
        if (typeof maybeMsg === 'string' && maybeMsg.trim()) {
            out.push({ path, message: maybeMsg })
            continue
        }

        if (typeof val === 'object')
            out.push(...flattenErrors(val as any, path))
    }
    return out
}

type Props = {
    initialValues: ToolArtifactFormValues | any
    saving?: boolean
    onSave: (v: ToolArtifactFormValues) => Promise<void> | void
}

export default function ToolArtifactForm({
    initialValues,
    saving,
    onSave,
}: Props) {
    const form = useForm<ToolArtifactFormValues>({
        resolver: zodResolver(ToolArtifactFormSchema),
        defaultValues: initialValues,
        mode: 'onChange',
    })

    console.log('initialValues', initialValues)
    console.log(
        'default version',
        initialValues?.version,
        'name',
        initialValues?.name,
    )

    const { control, register, handleSubmit, watch, formState } = form

    const sourceType = watch('sourceType')
    const runtime = watch('runtime')
    
    // ✅ IMPORTANT: read input and output schemas
    const inputSchema = watch('inputSchema') ?? ''
    const outputSchema = watch('outputSchema') ?? ''

    const envFA = useFieldArray({ control, name: 'env' })
    const permissions = watch('permissionsRequested') ?? []

    React.useEffect(() => {
        form.reset(initialValues) // ✅ re-apply new initial values
    }, [initialValues, form])

    const addPermission = (p: string) => {
        const v = p.trim()
        if (!v) return
        if (permissions.includes(v)) return
        form.setValue('permissionsRequested', [...permissions, v], {
            shouldDirty: true,
            shouldValidate: true,
        })
    }

    const removePermission = (p: string) => {
        form.setValue(
            'permissionsRequested',
            permissions.filter((x: string) => x !== p),
            { shouldDirty: true, shouldValidate: true },
        )
    }

    const submit = handleSubmit(async (values) => {
        const payload = {
            ...values,
            inputSchema: parseJsonObjectOrNull(values.inputSchema),
            outputSchema: parseJsonObjectOrNull(values.outputSchema),
        }
        await onSave(payload as any)
    })

    const allErrors = flattenErrors(formState.errors)

    return (
        <form onSubmit={submit} className="space-y-4">
            <Card className="p-4 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-medium">Tool Details</h2>

                    {allErrors.length > 0 && formState.isDirty && (
                        <div className="mt-2 mb-2 rounded-xl border border-red-200 bg-red-50 p-3">
                            <div className="text-sm font-medium text-red-700">
                                Please fix:
                            </div>
                            <ul className="mt-2 list-disc pl-5 text-sm text-red-700 space-y-1">
                                {allErrors.map((e) => (
                                    <li key={e.path}>
                                        <span className="font-mono">
                                            {e.path}
                                        </span>
                                        : {e.message}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="default"
                        onClick={() => form.trigger()}
                    >
                        Validate
                    </Button>
                    <Button type="submit" loading={!!saving}>
                        Save
                    </Button>
                </div>
            </Card>

            {/* Meta */}
            <Card className="p-4 rounded-2xl shadow-sm space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium">Name</label>
                        <Input {...register('name')} />
                        {formState.errors.name?.message && (
                            <p className="text-xs text-red-500">
                                {String(formState.errors.name.message)}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium">Status</label>
                        <Controller
                            control={control}
                            name="status"
                            render={({ field }) => (
                                <Select
                                    options={statusOptions}
                                    value={statusOptions.find(
                                        (o) => o.value === field.value,
                                    )}
                                    onChange={(o: any) =>
                                        field.onChange(o?.value)
                                    }
                                />
                            )}
                        />
                        {formState.errors.status?.message && (
                            <p className="text-xs text-red-500">
                                {String(formState.errors.status.message)}
                            </p>
                        )}
                    </div>

                    <div className="md:col-span-3">
                        <label className="text-sm font-medium">
                            Description
                        </label>
                        <Input textArea {...register('description')} />
                        {formState.errors.description?.message && (
                            <p className="text-xs text-red-500">
                                {String(formState.errors.description.message)}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium">Version</label>
                        <Input {...register('version')} />
                        {formState.errors.version?.message && (
                            <p className="text-xs text-red-500">
                                {String(formState.errors.version.message)}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium">Runtime</label>
                        <Controller
                            control={control}
                            name="runtime"
                            render={({ field }) => (
                                <Select
                                    options={runtimeOptions}
                                    value={runtimeOptions.find(
                                        (o) => o.value === field.value,
                                    )}
                                    onChange={(o: any) =>
                                        field.onChange(o?.value)
                                    }
                                />
                            )}
                        />
                        {formState.errors.runtime?.message && (
                            <p className="text-xs text-red-500">
                                {String(formState.errors.runtime.message)}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium">Source</label>
                        <Controller
                            control={control}
                            name="sourceType"
                            render={({ field }) => (
                                <Select
                                    options={sourceOptions}
                                    value={sourceOptions.find(
                                        (o) => o.value === field.value,
                                    )}
                                    onChange={(o: any) =>
                                        field.onChange(o?.value)
                                    }
                                />
                            )}
                        />
                        {formState.errors.sourceType?.message && (
                            <p className="text-xs text-red-500">
                                {String(formState.errors.sourceType.message)}
                            </p>
                        )}
                    </div>

                    {sourceType === 'artifact_ref' && (
                        <div className="md:col-span-3">
                            <label className="text-sm font-medium">
                                Artifact Reference
                            </label>
                            <Input
                                placeholder="oci://... or s3://..."
                                {...register('artifactRef')}
                            />
                            {formState.errors.artifactRef?.message && (
                                <p className="text-xs text-red-500">
                                    {String(
                                        formState.errors.artifactRef.message,
                                    )}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </Card>

            {/* Implementation */}
            <Card className="p-4 rounded-2xl shadow-sm space-y-3">
                <h3 className="font-medium">Implementation</h3>

                {sourceType === 'inline_code' && (
                    <ToolArtifactCodeEditor
                        control={control}
                        form={form}
                        runtime={runtime}
                        errorText={
                            formState.errors.code?.message
                                ? String(formState.errors.code.message)
                                : undefined
                        }
                    />
                )}

                {sourceType === 'artifact_ref' && (
                    <p className="text-sm text-muted-foreground">
                        This tool runs from an external artifact reference
                        (OCI/S3). Code editor is disabled.
                    </p>
                )}
            </Card>

            {/* Contract */}
            <Card className="p-4 rounded-2xl shadow-sm space-y-3">
                <h3 className="font-medium">Contract (Schemas)</h3>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                    {/* INPUT */}
                    <div className="space-y-3">
                        <JsonSchemaBuilder
                            label="Input schema builder"
                            value={inputSchema}
                            onChange={(schema: any) =>
                                form.setValue(
                                    'inputSchema',
                                    JSON.stringify(schema, null, 2),
                                    { shouldDirty: true, shouldValidate: true },
                                )
                            }
                        />

                        <ToolArtifactJsonSchemaEditor
                            control={control}
                            form={form}
                            name="inputSchema"
                            label="inputSchema (JSON)"
                            height={260}
                            helperText="Defines tool input validation contract."
                            errorText={
                                formState.errors.inputSchema?.message
                                    ? String(formState.errors.inputSchema.message)
                                    : undefined
                            }
                            template={{
                                type: 'object',
                                properties: {
                                    query: { type: 'string' },
                                },
                                required: ['query'],
                            }}
                        />
                    </div>

                    {/* OUTPUT */}
                    <div className="space-y-3">
                        <JsonSchemaBuilder
                            label="Output schema builder"
                            value={outputSchema}
                            onChange={(schema: any) =>
                                form.setValue(
                                    'outputSchema',
                                    JSON.stringify(schema, null, 2),
                                    { shouldDirty: true, shouldValidate: true },
                                )
                            }
                        />

                        <ToolArtifactJsonSchemaEditor
                            control={control}
                            form={form}
                            name="outputSchema"
                            label="outputSchema (JSON)"
                            height={260}
                            helperText="Defines expected tool output contract."
                            errorText={
                                formState.errors.outputSchema?.message
                                    ? String(formState.errors.outputSchema.message)
                                    : undefined
                            }
                            template={{
                                type: 'object',
                                properties: {
                                    result: { type: 'string' },
                                },
                                required: ['result'],
                            }}
                        />
                    </div>
                </div>
            </Card>

            {/* Permissions */}
            <Card className="p-4 rounded-2xl shadow-sm space-y-3">
                <h3 className="font-medium">Permissions</h3>

                <div className="flex gap-2">
                    <Input
                        id="permInput"
                        placeholder='ex: "architecture.read"'
                    />
                    <Button
                        type="button"
                        onClick={() => {
                            const el = document.getElementById(
                                'permInput',
                            ) as HTMLInputElement
                            addPermission(el.value)
                            el.value = ''
                        }}
                    >
                        Add
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {permissions.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            No permissions requested.
                        </p>
                    )}
                    {permissions.map((p: string) => (
                        <span
                            key={p}
                            className="px-2 py-1 rounded-full bg-gray-100 text-sm flex items-center gap-2"
                        >
                            {p}
                            <button
                                type="button"
                                className="text-red-500"
                                onClick={() => removePermission(p)}
                            >
                                ✕
                            </button>
                        </span>
                    ))}
                </div>
            </Card>

            {/* Limits */}
            <Card className="p-4 rounded-2xl shadow-sm space-y-3">
                <h3 className="font-medium">Limits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="text-sm font-medium">timeoutMs</label>
                        <Input
                            type="number"
                            {...register('limits.timeoutMs', {
                                valueAsNumber: true,
                            })}
                        />
                        {(formState.errors as any).limits?.timeoutMs
                            ?.message && (
                            <p className="text-xs text-red-500">
                                {String(
                                    (formState.errors as any).limits.timeoutMs
                                        .message,
                                )}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium">
                            maxMemoryMb
                        </label>
                        <Input
                            type="number"
                            {...register('limits.maxMemoryMb', {
                                valueAsNumber: true,
                            })}
                        />
                        {(formState.errors as any).limits?.maxMemoryMb
                            ?.message && (
                            <p className="text-xs text-red-500">
                                {String(
                                    (formState.errors as any).limits.maxMemoryMb
                                        .message,
                                )}
                            </p>
                        )}
                    </div>
                </div>
            </Card>

            {/* Env */}
            <Card className="p-4 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium">Environment Variables</h3>
                    <Button
                        type="button"
                        onClick={() =>
                            envFA.append({
                                key: '',
                                value: '',
                                secret: false,
                            } as any)
                        }
                    >
                        Add env
                    </Button>
                </div>

                <div className="space-y-2">
                    {envFA.fields.map((f, idx) => (
                        <div
                            key={f.id}
                            className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center"
                        >
                            <div className="md:col-span-4">
                                <Input
                                    placeholder="KEY"
                                    {...register(`env.${idx}.key` as const)}
                                />
                                {(formState.errors as any).env?.[idx]?.key
                                    ?.message && (
                                    <p className="text-xs text-red-500">
                                        {String(
                                            (formState.errors as any).env[idx]
                                                .key.message,
                                        )}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-6">
                                <Input
                                    placeholder="value"
                                    {...register(`env.${idx}.value` as const)}
                                />
                                {(formState.errors as any).env?.[idx]?.value
                                    ?.message && (
                                    <p className="text-xs text-red-500">
                                        {String(
                                            (formState.errors as any).env[idx]
                                                .value.message,
                                        )}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-1 flex justify-center">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4"
                                    {...register(`env.${idx}.secret` as const)}
                                />
                            </div>

                            <div className="md:col-span-1 text-right">
                                <Button
                                    type="button"
                                    variant="default"
                                    onClick={() => envFA.remove(idx)}
                                >
                                    ✕
                                </Button>
                            </div>
                        </div>
                    ))}
                    {envFA.fields.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            No env vars.
                        </p>
                    )}
                </div>
            </Card>
        </form>
    )
}
