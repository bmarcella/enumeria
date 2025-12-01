// canvas-box/canvasBoxSchema.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { z } from 'zod';
import { VisibilityTypeAttributes, RelationshipType, VisibilityTypeClass, CanvasBoxClassification, EntityStereotype } from '../../../../../../common/Entity/CanvasBox';

const attributeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Required'),
  type: z.string().optional(),
  label: z.string().optional(),
  visibility: z.nativeEnum(VisibilityTypeAttributes),
  isMapped: z.boolean().default(true),
  isArray: z.boolean().optional(),
  isId: z.boolean().optional(),
  isGenerateAuto: z.boolean().optional(),
  nullable: z.boolean().optional(),
  required: z.boolean().optional(),
  default: z.union([z.string(), z.number(), z.boolean()]).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  readOnly: z.boolean().optional(),
  hidden: z.boolean().optional(),
  relation: z
    .object({
      type: z.nativeEnum(RelationshipType),
      targetEntity: z.string().min(1, 'Required'),
      targetEntityAttribute: z.string().min(1, 'Required'),
    })
    .partial()
    .optional(),
});

export const canvasBoxSchema = z.object({
  // Step 1 (mandatory)
  entityName: z.string().min(1, 'Required'),
  stereotype: z.nativeEnum(EntityStereotype),
  description: z.string().optional(),
  extendsId: z.string().optional(),
  classification: z.nativeEnum(CanvasBoxClassification).optional(),

  // Step 2
  mapConfig: z
    .object({
      tableName: z.string().optional(),
      schema: z.string().optional(),
      namespace: z.string().optional(),
      pluralName: z.string().optional(),
      softDelete: z.boolean().optional(),
      versioned: z.boolean().optional(),
      generateApi: z.boolean().optional(),
      generateCrud: z.boolean().optional(),
    })
    .optional(),

  // Step 3
  diagramConfig: z
    .object({
      visibility: z.nativeEnum(VisibilityTypeClass),
      isAbstract: z.boolean().optional(),
      isAuth: z.boolean().optional(),
      color: z.string().optional(),
      icon: z.string().optional(),
      locked: z.boolean().optional(),
    })
    .optional(),

  // Step 4
  attributes: z.array(attributeSchema).optional(),

  // Step 5
  // store as string, parse JSON on server if needed
  rules: z.string().optional(),
  mixins: z.array(z.string()).optional(),
});

export type CanvasBoxFormValues = z.infer<typeof canvasBoxSchema>;
