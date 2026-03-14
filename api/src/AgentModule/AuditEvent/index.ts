// src/services/AuditEventService.ts

import {
  BehaviorsChainLooper,
  createDambaService,
  DambaService,
} from "@Damba/v2/service/DambaService";

import { Http } from "@Damba/v2/service/IServiceDamba";
import { createAuditEventBehavior, listAuditEventsBehavior } from "./Behavior";
import { CreateAuditEventBody, QueryAuditEvents } from "./validators";
import { AuditEvent } from "@App/entities/agents/AuditEvent";

// --------------------------------------------------
// Service
// --------------------------------------------------

const service = {
  name: "/audit_events",
  entity: AuditEvent,
} as DambaService;



const behaviors: BehaviorsChainLooper = {
  "/create": {
    method: Http.POST,
    behavior: createAuditEventBehavior,
    config: { validators: { body: CreateAuditEventBody } },
  },
  "/": {
    method: Http.GET,
    behavior: listAuditEventsBehavior,
    config: { validators: { query: QueryAuditEvents } },
  },
};

export default createDambaService({ service, behaviors });