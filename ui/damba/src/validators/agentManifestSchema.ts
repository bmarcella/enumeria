import z from 'zod'

export const ToolTypeEnum = z.enum([
    'tavily_search',
    'qdrant_retriever',
    'http',
    'damba_architecture_read',
    'damba_propose_patch',
    'custom_plugin',
])

export const ToolConfigSchema = z.object({
    name: z.string().min(1),
    type: ToolTypeEnum,
    enabled: z.boolean().optional().default(true),
    config: z.record(z.any()).optional().default({}),
})

export const SubAgentSchema = z.object({
    id: z.string().min(1),
    kind: z
        .enum([
            'simple',
            'multi_step',
            'stateful',
            'rag',
            'tool_only',
            'pipeline_no_agent',
            'pipeline',
        ])
        .default('simple'),
    systemPrompt: z.string().optional().default(''),
    tools: z.array(z.string()).optional().default([]),
    maxIterations: z.number().int().min(1).max(50).optional().default(12),
    outputSchema: z.record(z.any()).optional(),
})

export const RunnableLambdaRefSchema = z.object({
    id: z.string().min(1),
    runnableLambdaId: z.string().uuid(),
});

export const PipelineStepSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('lambda'),
        lambdaId: z.string().min(1),
        name: z.string().optional(),
    }),
    z.object({
        type: z.literal('tool'),
        toolName: z.string().min(1),
        name: z.string().optional(),
    }),
    z.object({
        type: z.literal('subAgent'),
        subAgentId: z.string().min(1),
        name: z.string().optional(),
    }),
    z.object({
        type: z.literal('router'),
        name: z.string().optional(),
        router: z.object({
            prompt: z.string().min(1),
            routes: z.record(z.string()),
        }),
    }),
])

export const EntrySchema = z.discriminatedUnion('kind', [
    z.object({
        kind: z.enum([
            'simple',
            'multi_step',
            'stateful',
            'router',
            'pipeline_no_agent',
            'tool_only',
        ]),
        systemPrompt: z
            .string()
            .optional()
            .default('You are a helpful assistant.'),
        router: z
            .object({
                prompt: z.string().min(1),
                routes: z.record(z.string()),
            })
            .optional(),
    }),
    
    z.object({
        kind: z.literal('pipeline'),
        steps: z.array(PipelineStepSchema).default([]),
    }),
])

export const AgentManifestSchema = z
    .object({
        version: z.string().min(1).default('1.0'),
        entry: EntrySchema,
        tools: z.array(ToolConfigSchema).optional().default([]),
        subAgents: z.array(SubAgentSchema).optional().default([]),
        runnableLambdas: z
            .array(RunnableLambdaRefSchema)
            .optional()
            .default([]),
        defaults: z
            .object({
                model: z.string().optional().default('gpt-4o-mini'),
                temperature: z.number().min(0).max(2).optional().default(0.2),
                maxOutputChars: z
                    .number()
                    .int()
                    .min(200)
                    .max(50000)
                    .optional()
                    .default(12000),
            })
            .optional()
            .default({}),
    })
    .superRefine((m, ctx) => {
        const toolNames = new Set((m.tools ?? []).map((t) => t.name))
        const subIds = new Set((m.subAgents ?? []).map((s) => s.id))
        const lambdaIds = new Set((m.runnableLambdas ?? []).map((l) => l.id))

        for (const [i, sa] of (m.subAgents ?? []).entries()) {
            for (const tn of sa.tools ?? []) {
                if (!toolNames.has(tn)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['subAgents', i, 'tools'],
                        message: `Unknown tool "${tn}" (not found in tools registry).`,
                    })
                }
            }
        }

        if (m.entry.kind === 'router') {
            const routes = m.entry.router?.routes ?? {}
            for (const [routeName, subId] of Object.entries(routes)) {
                if (!subIds.has(subId)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['entry', 'router', 'routes', routeName],
                        message: `Route "${routeName}" points to unknown subAgent "${subId}".`,
                    })
                }
            }
        }

        if (m.entry.kind === 'pipeline') {
            for (const [i, step] of m.entry.steps.entries()) {
                if (step.type === 'lambda' && !lambdaIds.has(step.lambdaId)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['entry', 'steps', i, 'lambdaId'],
                        message: `Unknown lambda "${step.lambdaId}" (not found in runnableLambdas registry).`,
                    })
                }

                if (step.type === 'tool' && !toolNames.has(step.toolName)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['entry', 'steps', i, 'toolName'],
                        message: `Unknown tool "${step.toolName}" (not found in tools registry).`,
                    })
                }

                if (step.type === 'subAgent' && !subIds.has(step.subAgentId)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['entry', 'steps', i, 'subAgentId'],
                        message: `Unknown subAgent "${step.subAgentId}" (not found in subAgents registry).`,
                    })
                }

                if (step.type === 'router') {
                    for (const [routeName, subId] of Object.entries(
                        step.router.routes,
                    )) {
                        if (!subIds.has(subId)) {
                            ctx.addIssue({
                                code: z.ZodIssueCode.custom,
                                path: [
                                    'entry',
                                    'steps',
                                    i,
                                    'router',
                                    'routes',
                                    routeName,
                                ],
                                message: `Route "${routeName}" points to unknown subAgent "${subId}".`,
                            })
                        }
                    }
                }
            }
        }
    })

export type AgentManifestFormValues = z.infer<typeof AgentManifestSchema>

export const defaultManifestValues: AgentManifestFormValues = {
    version: '1.0',
    entry: {
        kind: 'simple',
        systemPrompt: 'You are a helpful assistant.',
    },
    tools: [],
    subAgents: [],
    runnableLambdas: [],
    defaults: {
        model: 'gpt-4o-mini',
        temperature: 0.2,
        maxOutputChars: 12000,
    },
}
