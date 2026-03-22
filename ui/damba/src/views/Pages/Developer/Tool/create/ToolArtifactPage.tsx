/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Button } from '@/components/ui'
import ToolArtifactForm from './ToolArtifactForm'
import { useToolArtifactsStore } from '@/stores/toolArtifactsStore'
import {
    ToolArtifactFormValues,
    defaultToolArtifactValues,
} from '@/validators/toolArtifactsSchema'

export function ToolArtifactPageBase() {
    const nav = useNavigate()
    const params = useParams() as any
    const id = params?.id

    const isCreate = !id || id === 'new'

    const { fetchOne, createOne, updateOne, deleteOne, loading, error } =
        useToolArtifactsStore()

    const [initialValues, setInitialValues] = useState<ToolArtifactFormValues>(
        defaultToolArtifactValues,
    )
    const [headerTitle, setHeaderTitle] = useState<string>(
        isCreate ? 'New Tool Artifact' : 'Tool Artifact',
    )

    useEffect(() => {
        let mounted = true

        ;(async () => {
            if (isCreate) {
                if (!mounted) return
                setInitialValues(defaultToolArtifactValues)
                setHeaderTitle('New Tool Artifact')
                return
            }

            const tool = await fetchOne(id)
            if (!mounted) return

            if (!tool) {
                setHeaderTitle('Tool Artifact (not found)')
                return
            }

            setHeaderTitle(`Edit: ${tool?.name ?? 'Tool Artifact'}`)

            // normalize shape for form
            setInitialValues({
                ...defaultToolArtifactValues,
                ...tool,
                limits: tool?.limits ?? defaultToolArtifactValues.limits,
                env: tool?.env ?? [],
                permissionsRequested: tool?.permissionsRequested ?? [],
                inputsSchema: tool?.inputsSchema ?? null,
                outputSchema: tool?.outputSchema ?? null,
            })
        })()

        return () => {
            mounted = false
        }
    }, [id, isCreate, fetchOne])

    const onSave = async (values: ToolArtifactFormValues) => {
        if (isCreate) {
            const created = await createOne(values)
            if (created?.id) nav(`/developer/tool/editor/${created.id}`)
            return
        }
        await updateOne(id, values)
    }

    const onDelete = async () => {
        if (isCreate) return
        await deleteOne(id)
        nav('/tool-artifacts')
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-4">
            <Card className="p-4 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">{headerTitle}</h1>
                    <p className="text-sm text-muted-foreground">
                        ToolArtifact is the installable “custom tool” that can
                        be referenced inside AgentManifest (custom_plugin).
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="default"
                        onClick={() => nav('/tool-artifacts')}
                    >
                        Back
                    </Button>

                    {!isCreate && (
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
                initialValues={initialValues}
                saving={loading}
                onSave={onSave}
            />
        </div>
    )
}

const ToolArtifactPage = () => <ToolArtifactPageBase></ToolArtifactPageBase>
export default ToolArtifactPage
