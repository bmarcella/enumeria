/* eslint-disable @typescript-eslint/no-explicit-any */
import z from 'zod'

export const ToolRuntimeEnum = z.enum(['node_vm', 'container', 'wasm'])
export const ToolSourceEnum = z.enum(['inline_code', 'artifact_ref'])

// ✅ Align with backend ToolArtifactStatus
export const ToolArtifactStatusEnum = z.enum([
    'draft',
    'submitted',
    'approved',
    'rejected',
    'delisted',
])

export const EnvVarSchema = z.object({
    key: z.string().min(1),
    value: z.string().optional().default(''),
    secret: z.boolean().optional().default(false),
})

function jsonObjectString() {
    return z
        .string()
        .trim()
        .nullable()
        .optional()
        .default(null)
        .superRefine((v, ctx) => {
            if (v == null || v === '') return
            try {
                const parsed = JSON.parse(v)
                const ok =
                    typeof parsed === 'object' &&
                    parsed !== null &&
                    !Array.isArray(parsed)
                if (!ok) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'Must be valid JSON representing an object.',
                    })
                }
            } catch {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Must be valid JSON.',
                })
            }
        })
}

export const ToolArtifactFormSchemaBase = z.object({
    name: z.string().min(2).max(120),
    description: z.string().max(5000).optional().default(''),

    version: z.string().min(1).max(32).default('1.0.0'),
    status: ToolArtifactStatusEnum.default('draft'),

    runtime: ToolRuntimeEnum.default('node_vm'),
    sourceType: ToolSourceEnum.default('inline_code'),

    // If sourceType=inline_code
    code: z.string().optional().default(''),

    // If sourceType=artifact_ref
    artifactRef: z.string().optional().default(''),

    // JSON schemas as strings (for Monaco)
    inputSchema: jsonObjectString(),
    outputSchema: jsonObjectString(),

    permissionsRequested: z.array(z.string()).optional().default([]),

    limits: z
        .object({
            timeoutMs: z
                .number()
                .int()
                .min(100)
                .max(300000)
                .optional()
                .default(20000),
            maxMemoryMb: z
                .number()
                .int()
                .min(16)
                .max(4096)
                .optional()
                .default(256),
        })
        .optional()
        .default({ timeoutMs: 20000, maxMemoryMb: 256 }),

    env: z.array(EnvVarSchema).optional().default([]),
})

export const ToolArtifactFormSchema = ToolArtifactFormSchemaBase.superRefine(
    (v, ctx) => {
        if (v.sourceType === 'inline_code') {
            if (!v.code || v.code.trim().length < 10) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['code'],
                    message:
                        'Code is required for inline_code (min ~10 chars).',
                })
            }
        }

        if (v.sourceType === 'artifact_ref') {
            if (!v.artifactRef || v.artifactRef.trim().length < 3) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['artifactRef'],
                    message: 'artifactRef is required for artifact_ref.',
                })
            }
        }
    },
)

export type ToolArtifactFormValues = z.infer<typeof ToolArtifactFormSchema>

export const TEMPLATE_CODE_TOOL = `/**
 * Custom Tool Example
 * input: { query: string }
 * output: { result: string }
 */
export async function run(input) {
  return { result: "Hello " + (input?.query ?? "world") };
}
`

export function toJsonStringOrNull(v: any): string | null {
    if (v === undefined || v === null) return null
    if (typeof v === 'string') return v.trim() ? v : null
    try {
        return JSON.stringify(v, null, 2)
    } catch {
        return null
    }
}

export const parseJsonObjectOrNull = (txt: unknown) => {
    if (txt == null) return null
    if (typeof txt !== 'string') return txt // already object (just in case)
    const s = txt.trim()
    if (!s) return null
    const parsed = JSON.parse(s)
    if (
        typeof parsed !== 'object' ||
        parsed === null ||
        Array.isArray(parsed)
    ) {
        throw new Error('Must be JSON object')
    }
    return parsed
}

// ✅ defaults are now VALID JSON strings (quoted keys, no trailing commas)
export const defaultToolArtifactValues: ToolArtifactFormValues = {
    name: '',
    description: '',
    version: '1.0.0',
    status: 'draft',
    runtime: 'node_vm',
    sourceType: 'inline_code',
    code: TEMPLATE_CODE_TOOL,
    artifactRef: '',
    inputSchema: JSON.stringify(
        {
            type: 'object',
            properties: {
                query: { type: 'string' },
            },
            required: ['query'],
            additionalProperties: false
        },
        null,
        2,
    ),
    outputSchema: JSON.stringify(
        {
            type: 'object',
            properties: {
                result: { type: 'string' },
            },
            required: ['result'],
            additionalProperties: false
        },
        null,
        2,
    ),
    permissionsRequested: [],
    limits: { timeoutMs: 20000, maxMemoryMb: 256 },
    env: [],
}
