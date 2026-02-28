
import { DEvent } from "@App/damba.import";
import { AgentDefinitionStatus, AgentDefinition, AgentListing, ListingVisibility } from "@App/entities/agents/AgentsConfig";
import { Behavior, DambaApi } from "@Damba/v2/service/DambaService";
import { CreateAgentDefinitionBody, AgentIdParams, UpdateAgentDefinitionBody, ApprovalListingDefaults, ModerationBody, AgentManifestSchema, ParamsSchema } from "../validators";
import { AuditEvent, AuditEventType } from "@App/entities/agents/AuditEvent";
import { audit, clampStr } from "../../helper";

export const createAgentDefinitionBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const body = CreateAgentDefinitionBody.parse(e.in.body);

    const def = new AgentDefinition();
    def.name = body.name;
    def.description = body.description;
    def.roleType = body.roleType;
    def.emoji = body.emoji;
    def.color = body.color;

    def.version = body.version;
    def.executionMode = body.executionMode;

    def.publisherOrgId = e.in.payload?.orgId ?? null;
    def.publisherUserId = e.in.payload?.id ?? null;

    def.scopes = body.scopes as any;
    def.capabilities = body.capabilities;
    def.permissionsRequested = body.permissionsRequested;

    def.inputsSchema = body.inputsSchema ?? null;
    def.artifactRef = body.artifactRef;

    def.agentManifest = body.agentManifest as any;

    def.status = AgentDefinitionStatus.Draft;

    const saved = await api?.DSave(def);

    await audit(api, e, {
      type: AuditEventType.AGENT_CREATED,
      orgId: saved?.publisherOrgId ?? null,
      resourceType: "AgentDefinition",
      resourceId: saved?.id ?? null,
      metadata: { name: saved?.name, version: saved?.version, mode: saved?.agentManifest?.mode ?? "artifact" },
    });

    e.out.send({ agentDefinition: saved });
  };
};

export const updateAgentDefinitionBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const { agentDefinitionId } = AgentIdParams.parse(e.in.params);
    const body = UpdateAgentDefinitionBody.parse(e.in.body);

    const def = await repo?.DGet1<AgentDefinition>(AgentDefinition, {
      where: { id: agentDefinitionId },
    });
    if (!def) throw new Error("AgentDefinition not found");

    // publisher guard (use policies in real app)
    if (e.in.payload?.orgId && def.publisherOrgId !== e.in.payload.orgId) throw new Error("Forbidden");

    if (![AgentDefinitionStatus.Draft, AgentDefinitionStatus.Rejected].includes(def.status))
      throw new Error("Only draft or rejected definitions can be edited");

    if (body.name !== undefined) def.name = body.name;
    if (body.description !== undefined) def.description = body.description;
    if (body.roleType !== undefined) def.roleType = body.roleType as any;
    if (body.emoji !== undefined) def.emoji = body.emoji;
    if (body.color !== undefined) def.color = body.color as any;

    if (body.version !== undefined) def.version = body.version;
    if (body.executionMode !== undefined) def.executionMode = body.executionMode as any;

    if (body.scopes !== undefined) def.scopes = body.scopes as any;
    if (body.capabilities !== undefined) def.capabilities = body.capabilities;
    if (body.permissionsRequested !== undefined) def.permissionsRequested = body.permissionsRequested;

    if (body.inputsSchema !== undefined) def.inputsSchema = body.inputsSchema ?? null;
    if (body.artifactRef !== undefined) def.artifactRef = body.artifactRef;

    if (body.agentManifest !== undefined) {
      // validate manifest if provided
      def.agentManifest = AgentManifestSchema.parse(body.agentManifest) as any;
    }

    const saved = await api?.DSave(def);

    await audit(api, e, {
      type: AuditEventType.AGENT_UPDATED,
      orgId: saved?.publisherOrgId ?? null,
      resourceType: "AgentDefinition",
      resourceId: saved?.id ?? null,
      metadata: { name: saved?.name, version: saved?.version },
    });

    e.out.send({ agentDefinition: saved });
  };
};

export const submitAgentDefinitionBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const { agentDefinitionId } = AgentIdParams.parse(e.in.params);

    const def = await repo?.DGet1<AgentDefinition>(AgentDefinition, { where: { id: agentDefinitionId } });
    if (!def) throw new Error("AgentDefinition not found");

    if (e.in.payload?.orgId && def.publisherOrgId !== e.in.payload.orgId) throw new Error("Forbidden");

    if (![AgentDefinitionStatus.Draft, AgentDefinitionStatus.Rejected].includes(def.status))
      throw new Error("Only draft/rejected can be submitted");

    def.status = AgentDefinitionStatus.Submitted;

    const saved = await api?.DSave(def);

    await audit(api, e, {
      type: AuditEventType.AGENT_SUBMITTED,
      orgId: saved?.publisherOrgId ?? null,
      resourceType: "AgentDefinition",
      resourceId: saved?.id ?? null,
      metadata: { name: saved?.name, version: saved?.version },
    });

    e.out.send({ agentDefinition: saved });
  };
};

export const approveAgentDefinitionBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const { agentDefinitionId } = AgentIdParams.parse(e.in.params);

    // admin guard (use policies in real app)
    if (!e.in.payload?.isAdmin) throw new Error("Admin required");

    const def = await repo?.DGet1<AgentDefinition>(AgentDefinition, { where: { id: agentDefinitionId } });
    if (!def) throw new Error("AgentDefinition not found");
    if (def.status !== AgentDefinitionStatus.Submitted) throw new Error("Only submitted can be approved");

    const listingDefaults = ApprovalListingDefaults.parse(e.in.body ?? {});

    def.status = AgentDefinitionStatus.Approved;
    const savedDef = await api?.DSave(def);

    if (listingDefaults.createListing) {
      const existingListing = await repo?.DGet1<AgentListing>(AgentListing, {
        where: { agentDefinitionId },
      });

      if (!existingListing) {
        const listing = new AgentListing();
        listing.agentDefinitionId = agentDefinitionId;
        listing.tags = listingDefaults.tags;
        listing.priceType = listingDefaults.priceType;
        listing.priceCents = listingDefaults.priceCents;
        listing.currency = listingDefaults.currency;
        listing.visibility = ListingVisibility.Unlisted;
        listing.publishedAt = null;

        await repo?.DSave(AgentListing, listing);
      }
    }

    await audit(api, e, {
      type: AuditEventType.AGENT_APPROVED,
      orgId: savedDef?.publisherOrgId ?? null,
      resourceType: "AgentDefinition",
      resourceId: savedDef?.id ?? null,
      metadata: { name: savedDef?.name, version: savedDef?.version },
    });

    e.out.send({ agentDefinition: savedDef });
  };
};

export const rejectAgentDefinitionBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const { agentDefinitionId } = AgentIdParams.parse(e.in.params);

    if (!e.in.payload?.isAdmin) throw new Error("Admin required");

    const def = await repo?.DGet1<AgentDefinition>(AgentDefinition, { where: { id: agentDefinitionId } });
    if (!def) throw new Error("AgentDefinition not found");
    if (def.status !== AgentDefinitionStatus.Submitted) throw new Error("Only submitted can be rejected");

    const { reason } = ModerationBody.parse(e.in.body ?? {});
    def.status = AgentDefinitionStatus.Rejected;

    const saved = await api?.DSave(def);

    await audit(api, e, {
      type: AuditEventType.AGENT_REJECTED,
      orgId: saved?.publisherOrgId ?? null,
      resourceType: "AgentDefinition",
      resourceId: saved?.id ?? null,
      metadata: { reason: clampStr(reason, 1000) },
    });

    e.out.send({ agentDefinition: saved });
  };
};

export const getAgentDefinitionBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const { agentDefinitionId } = AgentIdParams.parse(e.in.params);

    const def = await repo?.DGet1<AgentDefinition>(AgentDefinition, { where: { id: agentDefinitionId } });
    if (!def) throw new Error("AgentDefinition not found");

    e.out.send({ agentDefinition: def });
  };
};

export const delistAgentDefinitionBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const { agentDefinitionId } = ParamsSchema.parse(e.in.params);

    // 1️⃣ Load definition
    const def = await repo?.DGet1<AgentDefinition>(AgentDefinition, {
      where: { id: agentDefinitionId },
    });

    if (!def) {
      throw new Error("AgentDefinition not found");
    }

    // 2️⃣ Authorization
    const isOwner = def.publisherOrgId === e.in.payload?.orgId;
    const isAdmin = e.in.payload?.isAdmin;

    if (!isOwner && !isAdmin) {
      throw new Error("Forbidden");
    }

    // 3️⃣ Load listing
    const listing = await repo?.DGet1<AgentListing>(AgentListing, {
      where: { agentDefinitionId },
    });

    if (!listing) {
      // Nothing to delist
      e.out.send({ message: "No listing found", agentDefinitionId });
      return;
    }

    // 4️⃣ Update listing (do NOT delete)
    listing.visibility = ListingVisibility.Unlisted;
    listing.publishedAt = null;

    await repo?.DSave(AgentListing, listing);

    // 5️⃣ Audit (non-blocking)
    try {
      const audit = new AuditEvent();
      audit.type = AuditEventType.AGENT_DELISTED;
      audit.orgId = def.publisherOrgId;
      audit.actorUserId = e.in.payload?.id ?? null;
      audit.resourceType = "AgentDefinition";
      audit.resourceId = def.id;
      audit.metadata = {
        listingId: listing.id,
      };

      await repo?.DSave(AuditEvent, audit);
    } catch {
      // Never break main flow
    }

    e.out.send({
      message: "Agent successfully delisted",
      agentDefinitionId,
      listingId: listing.id,
    });
  };
};