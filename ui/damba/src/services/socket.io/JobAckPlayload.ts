export type JobAckPayload = {
    id: string
    prompt: string
    correlationId: string
    tenant_id: string
    status: 'queued' | 'in_progress' | 'completed' | 'failed'
    event: string // replace with proper type if you have one
}
