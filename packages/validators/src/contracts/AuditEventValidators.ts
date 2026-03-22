// Validators
// --------------------------------------------------
import { AuditEventType } from "@Database/entities/agents/contracts/AuditEvent";
import z from "zod";

export const CreateAuditEventBody = z.object({
  type: z.nativeEnum(AuditEventType),
  orgId: z.string().uuid().optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
});

export const QueryAuditEvents = z.object({
  orgId: z.string().uuid().optional(),
  type: z.nativeEnum(AuditEventType).optional(),
  resourceId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});