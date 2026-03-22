// --------------------------------------------------
// Behaviors
// --------------------------------------------------

import { DEvent } from "@App/damba.import";
import { Behavior, DambaApi } from "@Damba/v2/service/DambaService";
import { CreateAuditEventBody, QueryAuditEvents } from "../../../../../packages/validators/src/contracts/AuditEventValidators";
import { AuditEvent } from "@App/entities/agents/AuditEvent";

/**
 * POST /audit_events/create
 * Normally used internally (but can be exposed if needed).
 */
export const createAuditEventBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const body = CreateAuditEventBody.parse(e.in.body);

    const event = new AuditEvent();
    event.type = body.type;
    event.orgId = body.orgId ?? e.in.payload?.orgId ?? null;
    event.actorUserId = e.in.payload?.id ?? null;
    event.resourceType = body.resourceType ?? undefined;
    event.resourceId = body.resourceId ?? undefined;
    event.metadata = body.metadata ?? null;

    // ✅ service.entity = AuditEvent => api.DSave OK
    const saved = await api?.DSave(event);

    e.out.send({ auditEvent: saved });
  };
};

/**
 * GET /audit_events
 * Query audit events
 */
export const listAuditEventsBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const q = QueryAuditEvents.parse(e.in.query ?? {});

    const where: any = {};
    if (q.orgId) where.orgId = q.orgId;
    if (q.type) where.type = q.type;
    if (q.resourceId) where.resourceId = q.resourceId;

    const events = await repo?.DGetAll<AuditEvent>(AuditEvent, {
      where,
      take: q.limit,
      order: { createdAt: "DESC" },
    });

    e.out.send({ events: events ?? [] });
  };
};