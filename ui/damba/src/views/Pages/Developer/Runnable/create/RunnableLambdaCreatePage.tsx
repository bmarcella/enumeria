/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui'
import {
    defaultRunnableLambdaValues,
    RunnableLambdaFormValues,
} from '@/validators/runnableLambdaSchema'
import { createRunnableLambda } from '@/services/agents/runnableLambda'
import RunnableLambdaForm from './RunnableLambdaForm'

function parseJsonOrNull(txt?: string) {
    const s = (txt ?? '').trim()
    if (!s) return null
    return JSON.parse(s)
}

export  function RunnableLambdaCreatePage() {
    const nav = useNavigate()
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSave = async (values: RunnableLambdaFormValues) => {
        setSaving(true)
        setError(null)

        try {
            const payload = {
                name: values.name,
                description: values.description ?? '',
                version: values.version,
                runtime: values.runtime,
                kind: values.kind,
                status: values.status,
                visibility: values.visibility,
                code: values.code,
                inputSchema: parseJsonOrNull(values.inputSchema),
                outputSchema: parseJsonOrNull(values.outputSchema),
                timeoutMs: values.timeoutMs,
                permissionsRequested: values.permissionsRequested ?? [],
            }

            const res = await createRunnableLambda(payload)
            const created = res?.runnableLambda ?? res?.data?.runnableLambda ?? res

            if (created?.id) {
                nav(`developer/runnable/${created.id}`)
                return
            }
            nav(`developer/runnable`)
        } catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? 'Failed to create runnable lambda')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-4">
            {error && (
                <Card className="p-3 border border-red-200 bg-red-50 rounded-xl">
                    <p className="text-sm text-red-700">{error}</p>
                </Card>
            )}

            <RunnableLambdaForm
                initialValues={defaultRunnableLambdaValues}
                saving={saving}
                onSave={handleSave}
            />
        </div>
    )
}

export default RunnableLambdaCreatePage;