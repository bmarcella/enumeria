/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Button } from '@/components/ui'
import { useToolArtifactsStore } from '@/stores/toolArtifactsStore'
import {
    ToolArtifactFormValues,
    defaultToolArtifactValues,
    parseJsonObjectOrNull,
    toJsonStringOrNull,
} from '@/validators/toolArtifactsSchema'
import ToolArtifactForm from '../create/ToolArtifactForm'

export function ToolArtifactEditorPageBase() {
    const nav = useNavigate()
    const { id } = useParams() as any
    const isNew = id === 'new' || !id

    const { fetchOne, createOne, updateOne, deleteOne, loading, error } =
        useToolArtifactsStore()

    const [initial, setInitial] = useState<ToolArtifactFormValues>(
        defaultToolArtifactValues,
    )

    useEffect(() => {
        let alive = true

        ;(async () => {
            if (isNew) return

            const data = await fetchOne(id)
            if (!alive) return

            if (data) {
                setInitial({
                    ...defaultToolArtifactValues,
                    ...data,
                    description: data?.description ?? '',
                    // normalize optional nested
                    limits: data?.limits ?? defaultToolArtifactValues.limits,
                    env: data?.env ?? [],
                    permissionsRequested: data?.permissionsRequested ?? [],

                    // IMPORTANT: backend stores these as objects|null,
                    // but Monaco editor needs strings => convert to pretty JSON strings
                    inputSchema: toJsonStringOrNull(data?.inputSchema),
                    outputSchema: toJsonStringOrNull(data?.outputSchema),
                })
            }
        })()

        return () => {
            alive = false
        }
    }, [id, isNew, fetchOne])

    const onSave = async (values: ToolArtifactFormValues) => {
        // Convert Monaco strings -> backend objects|null
        const payload: any = {
            ...values,
            inputSchema: parseJsonObjectOrNull((values as any).inputSchema),
            outputSchema: parseJsonObjectOrNull((values as any).outputSchema),
        }

        if (isNew) {
            const created = await createOne(payload)
            if (created?.id) nav(`/developer/tool/editor/${created.id}`)
        } else {
            await updateOne(id, payload)
        }
    }

    const onDelete = async () => {
        if (!isNew) {
            await deleteOne(id)
            nav('/tool-artifacts')
        }
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-4">
            <Card className="p-4 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">
                        {isNew ? 'New Tool Artifact' : 'Edit Tool Artifact'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        This tool will be referenced by agent manifests
                        (custom_plugin tool type).
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="default"
                        onClick={() => nav('/tool-artifacts')}
                    >
                        Back
                    </Button>
                    {!isNew && (
                        <Button
                            variant="default"
                            onClick={onDelete}
                            loading={loading}
                        >
                            Delete
                        </Button>
                    )}
                </div>
            </Card>

            {error && (
                <Card className="p-4 rounded-2xl border border-red-200">
                    <p className="text-sm text-red-600">{error}</p>
                </Card>
            )}

            <ToolArtifactForm
                initialValues={initial}
                saving={loading}
                onSave={onSave}
            />
        </div>
    )
}

const ToolArtifactEditorPage = () => {
    return <ToolArtifactEditorPageBase />
}

export default ToolArtifactEditorPage
