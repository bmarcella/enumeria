import { z } from 'zod';

export const DataModelEntityCreateBody = z.object({
  name: z.string().min(1).max(160),
  description: z.string().max(2000).optional().nullable(),
  positionX: z.number().optional().default(0),
  positionY: z.number().optional().default(0),
  width: z.number().optional().default(200),
  height: z.number().optional().default(100),
  color: z.string().optional().nullable(),
  tableName: z.string().max(128).optional().nullable(),
  orgId: z.string().uuid(),
  projId: z.string().uuid(),
  appId: z.string().uuid(),
  moduleId: z.string().uuid(),
  servId: z.string().uuid(),
});

export const DataModelEntityUpdateBody = DataModelEntityCreateBody.partial();

export const DataModelColumnCreateBody = z.object({
  name: z.string().min(1).max(128),
  dataType: z.string().min(1).max(64),
  isPrimaryKey: z.boolean().optional().default(false),
  isForeignKey: z.boolean().optional().default(false),
  isUnique: z.boolean().optional().default(false),
  isNotNull: z.boolean().optional().default(false),
  isArray: z.boolean().optional().default(false),
  defaultValue: z.string().max(255).optional().nullable(),
  checkConstraint: z.string().max(500).optional().nullable(),
  length: z.number().int().optional().nullable(),
  precision: z.number().int().optional().nullable(),
  scale: z.number().int().optional().nullable(),
  comment: z.string().max(1000).optional().nullable(),
  ordinal: z.number().int().optional().default(0),
});

export const DataModelColumnUpdateBody = DataModelColumnCreateBody.partial();

export const DataModelRelationshipCreateBody = z.object({
  fromEntityId: z.string().uuid(),
  toEntityId: z.string().uuid(),
  type: z.enum(['1:1', '1:N', 'N:1', 'N:N']),
  name: z.string().max(160).optional().nullable(),
  color: z.string().optional().nullable(),
  fkColumnId: z.string().uuid().optional().nullable(),
  onDelete: z.enum(['RESTRICT', 'CASCADE', 'SET NULL']).optional().default('RESTRICT'),
  onUpdate: z.enum(['RESTRICT', 'CASCADE', 'SET NULL']).optional().default('RESTRICT'),
  description: z.string().max(2000).optional().nullable(),
  orgId: z.string().uuid(),
  projId: z.string().uuid(),
});

export const EntityIdParams = z.object({ entityId: z.string().uuid() });
export const ColumnIdParams = z.object({ entityId: z.string().uuid(), columnId: z.string().uuid() });
export const RelationshipIdParams = z.object({ relationshipId: z.string().uuid() });
