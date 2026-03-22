import { z } from 'zod'

export const AgentExecutionModeSchema = z.enum(['studio', 'runtime', 'both'])

export const CreateAgentDefinitionUiSchema = z.object({
    name: z.string().min(2).max(120),
    description: z.string().min(2).max(5000).optional().default(''),
    roleType: z.string().min(2),
    emoji: z.string().min(1).max(32),
    color: z.string().min(2),

    version: z.string().min(1).max(32).default('0.1.0'),
    executionMode: AgentExecutionModeSchema.default('studio'),

    scopes: z.array(z.string()).default(['project']),
    capabilities: z.array(z.string()).default([]),
    permissionsRequested: z.array(z.string()).default(['analyze']),

    inputsSchema: z.any().nullable().optional(),
    artifactRef: z.string().max(255).optional().default(''),
    agentManifest: z.any().nullable().optional().default(null),
})

export type CreateAgentDefinitionUi = z.infer<
    typeof CreateAgentDefinitionUiSchema
>

// Update: tout optionnel
export const UpdateAgentDefinitionUiSchema =
    CreateAgentDefinitionUiSchema.partial()
export type UpdateAgentDefinitionUi = z.infer<
    typeof UpdateAgentDefinitionUiSchema
>
