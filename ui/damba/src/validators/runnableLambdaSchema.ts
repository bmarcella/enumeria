import z from "zod"

export const RunnableLambdaRuntimeEnum = z.enum(["node_vm"])
export const RunnableLambdaKindEnum = z.enum([
  "inline_transform",
  "inline_predicate",
  "inline_mapper",
  "inline_reducer",
])

export const RunnableLambdaStatusEnum = z.enum([
  "draft",
  "submitted",
  "approved",
  "rejected",
  "delisted",
])

export const RunnableLambdaVisibilityEnum = z.enum([
  "private",
  "org",
  "public",
  "unlisted",
])

function jsonObjectString(fieldLabel: string) {
  return z
    .string()
    .optional()
    .default("")
    .superRefine((val, ctx) => {
      const s = (val ?? "").trim()
      if (!s) return

      try {
        const parsed = JSON.parse(s)
        if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${fieldLabel} must be a JSON object`,
          })
        }
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${fieldLabel} must be valid JSON`,
        })
      }
    })
}

export const RunnableLambdaFormSchemaBase = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(5000).optional().default(""),

  version: z.string().min(1).max(32).default("1.0.0"),

  runtime: RunnableLambdaRuntimeEnum.default("node_vm"),
  kind: RunnableLambdaKindEnum.default("inline_transform"),

  status: RunnableLambdaStatusEnum.default("draft"),
  visibility: RunnableLambdaVisibilityEnum.default("private"),

  code: z.string().optional().default(""),

  inputSchema: jsonObjectString("inputSchema"),
  outputSchema: jsonObjectString("outputSchema"),

  timeoutMs: z.number().int().min(50).max(10000).default(1000),

  permissionsRequested: z.array(z.string()).optional().default([]),
})

export const RunnableLambdaFormSchema = RunnableLambdaFormSchemaBase.superRefine((v, ctx) => {
  if (!v.code || v.code.trim().length < 10) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["code"],
      message: "Code is required (min ~10 chars).",
    })
  }
})

export type RunnableLambdaFormValues = z.infer<typeof RunnableLambdaFormSchema>

export const defaultRunnableLambdaValues: RunnableLambdaFormValues = {
  name: "",
  description: "",
  version: "1.0.0",
  runtime: "node_vm",
  kind: "inline_transform",
  status: "draft",
  visibility: "private",
  code: `/**
 * Runnable Lambda Example
 * input: any
 * output: any
 */
export async function run(input, ctx) {
  return input;
}
`,
  inputSchema: `{
  "type": "object",
  "properties": {
    "query": { "type": "string" }
  },
  "required": ["query"]
}
`,
  outputSchema: `{
  "type": "object",
  "properties": {
    "result": { "type": "string" }
  },
  "required": ["result"]
}
`,
  timeoutMs: 1000,
  permissionsRequested: [],
}