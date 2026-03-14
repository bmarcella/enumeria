/* eslint-disable @typescript-eslint/no-explicit-any */
import { ToolRuntime, ToolVisibility, ToolSourceType } from '@App/entities/agents/ToolArtifactAndRunnableLambda';
import z from 'zod';

export const ToolRuntimeEnum = z.nativeEnum(ToolRuntime);
export const ToolVisibilityEnum = z.nativeEnum(ToolVisibility);
export const ToolSourceTypeEnum = z.nativeEnum(ToolSourceType);

export const ToolLimitsSchema = z
  .object({
    timeoutMs: z.number().int().min(100).max(300000).optional().default(20000),
    maxMemoryMb: z.number().int().min(16).max(4096).optional().default(256),
  })
  .optional()
  .default({ timeoutMs: 20000, maxMemoryMb: 256 });

export const EnvVarSchema = z.object({
  key: z.string().min(1),
  value: z.string().optional().default(''),
  secret: z.boolean().optional().default(false),
});

function refineToolArtifact(v: any, ctx: z.RefinementCtx) {
  if (v?.sourceType === ToolSourceType.InlineCode) {
    if (!v.code || String(v.code).trim().length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['code'],
        message: 'Code is required for inline_code (min ~10 chars).',
      });
    }
  }

  if (v?.sourceType === ToolSourceType.ArtifactRef) {
    if (!v.artifactRef || String(v.artifactRef).trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['artifactRef'],
        message: 'artifactRef is required for artifact_ref.',
      });
    }
  }

  // Optional: validate hash format if provided
  if (v?.contentHash && !/^sha256:[a-f0-9]{64}$/i.test(String(v.contentHash))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['contentHash'],
      message: 'contentHash must look like "sha256:<64-hex>"',
    });
  }
}

/**
 * ✅ BASE object schema (no superRefine) => supports .partial()
 */
export const ToolArtifactBodyBase = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(3).max(5000).optional().default(''),

  version: z.string().min(1).max(32).default('1.0.0'),
  runtime: ToolRuntimeEnum.default(ToolRuntime.NodeVM),

  sourceType: ToolSourceTypeEnum.default(ToolSourceType.InlineCode),

  // inline_code
  code: z.string().optional().default(''),

  // artifact_ref
  artifactRef: z.string().min(0).max(255).optional().default(''),

  // computed server-side ideally
  contentHash: z.string().min(12).max(72).optional(),

  // contracts
  inputSchema: z.record(z.any()).nullable().optional().default(null),
  outputSchema: z.record(z.any()).nullable().optional().default(null),

  permissionsRequested: z.array(z.string()).optional().default([]),

  limits: ToolLimitsSchema,

  env: z.array(EnvVarSchema).optional().default([]),

  sandboxPolicy: z.record(z.any()).nullable().optional().default(null),

  visibility: ToolVisibilityEnum.optional().default(ToolVisibility.Private),
});

/**
 * ✅ CREATE schema (with superRefine)
 */
export const CreateToolArtifactBody = ToolArtifactBodyBase.superRefine(refineToolArtifact);

/**
 * ✅ UPDATE schema:
 * - partial() is applied on base object (works)
 * - then superRefine re-applied (optional but recommended)
 */
export const UpdateToolArtifactBody =
  ToolArtifactBodyBase.partial().superRefine(refineToolArtifact);

export const ToolArtifactIdParams = z.object({
  toolArtifactId: z.string().uuid(),
});

export const SubmitToolArtifactBody = z.object({});

export const ApproveToolArtifactBody = z.object({
  publish: z.boolean().optional().default(false),
});

export const RejectToolArtifactBody = z.object({
  reason: z.string().min(1).max(2000),
});

export type CreateToolArtifactBodyType = z.infer<typeof CreateToolArtifactBody>;
export type UpdateToolArtifactBodyType = z.infer<typeof UpdateToolArtifactBody>;
