import { z } from 'zod';

export const UseCaseActorCreateBody = z.object({
  name: z.string().min(1).max(160),
  type: z.enum(['human', 'system', 'external']).default('human'),
  description: z.string().max(2000).optional().nullable(),
  positionX: z.number().optional().default(0),
  positionY: z.number().optional().default(0),
  color: z.string().optional().nullable(),
  orgId: z.string().uuid(),
  projId: z.string().uuid(),
});

export const UseCaseActorUpdateBody = UseCaseActorCreateBody.partial();
export const ActorIdParams = z.object({ actorId: z.string().uuid() });

export const UseCaseCreateBody = z.object({
  name: z.string().min(1).max(255),
  role: z.string().max(255).optional().nullable(),
  action: z.string().max(2000).optional().nullable(),
  benefit: z.string().max(2000).optional().nullable(),
  description: z.string().max(4000).optional().nullable(),
  positionX: z.number().optional().default(0),
  positionY: z.number().optional().default(0),
  color: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  orgId: z.string().uuid(),
  projId: z.string().uuid(),
});

export const UseCaseUpdateBody = UseCaseCreateBody.partial();
export const UseCaseIdParams = z.object({ useCaseId: z.string().uuid() });

export const UseCaseScenarioCreateBody = z.object({
  title: z.string().min(1).max(255),
  content: z.string().max(10000).optional().nullable(),
  type: z.enum(['nominal', 'alternative', 'exception']).default('nominal'),
  ordinal: z.number().int().optional().default(0),
});

export const UseCaseScenarioUpdateBody = UseCaseScenarioCreateBody.partial();
export const ScenarioIdParams = z.object({ useCaseId: z.string().uuid(), scenarioId: z.string().uuid() });

export const UseCaseRelationshipCreateBody = z.object({
  fromId: z.string().uuid(),
  fromType: z.enum(['actor', 'usecase']),
  toId: z.string().uuid(),
  toType: z.enum(['actor', 'usecase']),
  type: z.enum(['association', 'include', 'extend', 'generalization']).default('association'),
  label: z.string().max(160).optional().nullable(),
  orgId: z.string().uuid(),
  projId: z.string().uuid(),
});

export const UCRelationshipIdParams = z.object({ relationshipId: z.string().uuid() });
