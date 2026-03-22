/* eslint-disable @typescript-eslint/no-explicit-any */
import z from 'zod';
import { RunnableLambdaRuntime, RunnableLambdaKind, RunnableLambdaStatus, RunnableLambdaVisibility } from '@Database/entities/agents/contracts/ToolArtifactAndRunnableLambda';

export const RunnableLambdaRuntimeEnum = z.nativeEnum(RunnableLambdaRuntime);
export const RunnableLambdaKindEnum = z.nativeEnum(RunnableLambdaKind);
export const RunnableLambdaStatusEnum = z.nativeEnum(RunnableLambdaStatus);
export const RunnableLambdaVisibilityEnum = z.nativeEnum(RunnableLambdaVisibility);

const RunnableLambdaSchemaObject = z.record(z.any());

function refineRunnableLambda(v: any, ctx: z.RefinementCtx) {
  if (v.kind === RunnableLambdaKind.InlinePredicate && v.outputSchema) {
    const outputType = (v.outputSchema as any)?.type;
    if (outputType && outputType !== 'boolean') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['outputSchema'],
        message: 'For inline_predicate, outputSchema.type should be "boolean".',
      });
    }
  }
}

export const CreateRunnableLambdaBodyBase = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(3).max(5000).default(''),
  version: z.string().min(1).max(32).default('1.0.0'),
  runtime: RunnableLambdaRuntimeEnum.default(RunnableLambdaRuntime.NodeVM),
  kind: RunnableLambdaKindEnum.default(RunnableLambdaKind.InlineTransform),
  code: z.string().min(10),
  inputSchema: RunnableLambdaSchemaObject.nullable().optional().default(null),
  outputSchema: RunnableLambdaSchemaObject.nullable().optional().default(null),
  timeoutMs: z.number().int().min(50).max(10000).default(1000),
  permissionsRequested: z.array(z.string()).optional().default([]),
  contentHash: z.string().optional(),
  visibility: RunnableLambdaVisibilityEnum.default(RunnableLambdaVisibility.Private),
  status: RunnableLambdaStatusEnum.optional(),
});

export const CreateRunnableLambdaBody =
  CreateRunnableLambdaBodyBase.superRefine(refineRunnableLambda);

export const UpdateRunnableLambdaBody =
  CreateRunnableLambdaBodyBase.partial().superRefine(refineRunnableLambda);

export const RunnableLambdaIdParams = z.object({
  runnableLambdaId: z.string().uuid(),
});

export const ApproveRunnableLambdaBody = z.object({
  publish: z.boolean().optional().default(false),
});

export const RejectRunnableLambdaBody = z.object({
  reason: z.string().min(1).max(2000),
});
