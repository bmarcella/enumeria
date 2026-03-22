/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { Card } from '@/components/ui'
import { AgentDefinitionCreateForm } from './AgentDefinitionCreateForm'
import { useNavigate } from 'react-router-dom'
import { createAgentDefinition } from '@/services/agents/AgentDefinition'
interface Props{
      getNewAgent: (payload: any) =>  void
}

export function AgentDefinitionCreate({getNewAgent}: Props) {
    const [submitting, setSubmitting] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)

    const onSubmit = async (payload: any) => {
        setServerError(null)
        setSubmitting(true)
        try {
            const res = await createAgentDefinition(payload)
            const agent = res?.agentDefinition ?? res
            getNewAgent(agent);
        } catch (e: any) {
            setServerError(
                e?.response?.data?.message ??
                    e?.message ??
                    'Failed to create agent',
            )
            throw e
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="p-4 md:p-6 space-y-4">
            <Card className="rounded-2xl p-4">
                <h3 className="text-xl font-semibold">
                    Create AI Agent (AgentDefinition)
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                    This creates a <b>Draft</b> definition in{' '}
                    <code>/api/v1/agent_catalog/damba</code>.
                </p>

                {serverError && (
                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                        {serverError}
                    </div>
                )}
            </Card>

            <AgentDefinitionCreateForm
                onSubmit={onSubmit}
                submitting={submitting}
            />
        </div>
    )
}

