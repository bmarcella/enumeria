import { z } from 'zod'

// garde ça proche de ton backend
export const AgentRoleTypeEnum = z.enum([
    'Developer',
    'SubjectExpert',
    'ProductManager',
    'QAEngineer',
    'Designer',
    'Architect',
    'BizOperations',
])

export const AgentColorEnum = z.enum([
    'Blue',
    'Cyan',
    'Orange',
    'Yellow',
    'Pink',
    'Purple',
    'Green',
])

export const AgentExecutionModeEnum = z.enum(['studio', 'runtime', 'both'])

export const ScopeTypeEnum = z.enum([
    'project',
    'application',
    'module',
    'service',
    'behavior',
])

// Manifest est “any” côté UI (tu le valideras mieux plus tard avec ton AgentManifestSchema)
export const AgentManifestUiSchema = z.any().nullable().optional()

export const CreateAgentDefinitionFormSchema = z.object({
    name: z.string().min(2, 'Name is required').max(120),
    description: z.string().min(2, 'Description is required').max(8000),

    roleType: AgentRoleTypeEnum,
    emoji: z.string().min(1, 'Emoji required').max(12),
    color: AgentColorEnum,

    version: z.string().min(1, 'Version required').max(32).default('0.1.0'),
    executionMode: AgentExecutionModeEnum.default('studio'),

    scopes: z
        .array(ScopeTypeEnum)
        .min(1, 'Select at least one scope')
        .default(['project']),
    capabilities: z.array(z.string()).default([]),
    permissionsRequested: z.array(z.string()).default([]),

    inputsSchema: z.any().nullable().optional(),
    artifactRef: z.string().max(255).optional().default(''),

    // text sarea JSON => on parse vers object avant envoi API
    agentManifest: z.string().optional().default(''),

    runnableLambdas: z
  .array(
    z.object({
      id: z.string().min(1),
      runnableLambdaId: z.string().uuid(),
    })
  )
  .optional()
  .default([]),
})

export type CreateAgentDefinitionForm = z.infer<
    typeof CreateAgentDefinitionFormSchema
>
