/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEvent } from '@App/damba.import';
import { Behavior, DambaApi } from '@Damba/v2/service/DambaService';
import { audit, clampStr } from '../../helper';
import { AuditEventType } from '@App/entities/agents/AuditEvent';
import {
  ToolArtifact,
  ToolVisibility,
  ToolArtifactStatus,
  ToolSourceType,
} from '@App/entities/agents/ToolArtifactAndRunnableLambda';
import {
  CreateToolArtifactBody,
  ToolArtifactIdParams,
  UpdateToolArtifactBody,
  ApproveToolArtifactBody,
  RejectToolArtifactBody,
} from '../validators';
import { computeToolContentHash } from '../utils';
import DResponse from '@Damba/core/DResponse';

async function getOrgAndUser(e: DEvent) {
  const userId = e.in.payload?.id ?? null;
  const config = await e.in.extras.users.getCurrentSetting(e);
  const orgId = config?.orgId ?? null;

  if (!orgId || !userId) {
    return { orgId: null, userId: null };
  }
  return { orgId, userId };
}

// ---------------------------
// CREATE
// ---------------------------
export const createToolArtifactBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const body = CreateToolArtifactBody.parse(e.in.body);

    const { orgId, userId } = await getOrgAndUser(e);
    if (!orgId || !userId) {
      return e.out.status(401).send({ message: 'Unauthorized' });
    }

    const tool = new ToolArtifact();
    tool.name = body.name;
    tool.description = body.description;

    tool.version = body.version;
    tool.runtime = body.runtime as any;

    // execution source
    tool.sourceType = body.sourceType as any;
    tool.code = body.sourceType === ToolSourceType.InlineCode ? (body.code ?? '') : null;
    tool.artifactRef =
      body.sourceType === ToolSourceType.ArtifactRef ? (body.artifactRef ?? '') : null;

    // contract
    tool.inputSchema = body?.inputSchema;
    tool.outputSchema = body?.outputSchema;

    // security / constraints
    tool.permissionsRequested = body.permissionsRequested ?? [];
    tool.limits = body.limits ?? null;
    tool.env = body.env ?? [];
    tool.sandboxPolicy = body.sandboxPolicy ?? null;

    tool.publisherOrgId = orgId;
    tool.publisherUserId = userId;

    tool.visibility = body.visibility ?? ToolVisibility.Private;
    tool.status = ToolArtifactStatus.Draft;

    // ✅ compute server-side hash from persisted fields
    tool.contentHash = computeToolContentHash({
      runtime: tool.runtime,
      sourceType: tool.sourceType,
      version: tool.version,
      code: tool.code,
      artifactRef: tool.artifactRef,
      limits: tool.limits,
      env: tool.env,
      permissionsRequested: tool.permissionsRequested,
      inputSchema: tool.inputSchema,
      outputSchema: tool.outputSchema,
      sandboxPolicy: tool.sandboxPolicy,
    });

    const saved = await api?.DSave(tool);

    await audit(api, e, {
      type: AuditEventType.AGENT_CREATED,
      orgId,
      resourceType: 'ToolArtifact',
      resourceId: saved?.id ?? null,
      metadata: {
        name: saved?.name,
        version: saved?.version,
        runtime: saved?.runtime,
        sourceType: saved?.sourceType,
      },
    });

    e.out.send({ toolArtifact: saved });
  };
};

// ---------------------------
// UPDATE (Draft/Rejected only)
// ---------------------------
export const updateToolArtifactBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const { toolArtifactId } = ToolArtifactIdParams.parse(e.in.params);
    const body = UpdateToolArtifactBody.parse(e.in.body);

    const { orgId, userId } = await getOrgAndUser(e);
    if (!orgId || !userId) throw new Error('Unauthorized');

    const tool = await repo?.DGet1<ToolArtifact>(ToolArtifact, { where: { id: toolArtifactId } });
    if (!tool) throw new Error('ToolArtifact not found');
    if (tool.publisherOrgId !== orgId) throw new Error('Forbidden');

    if (![ToolArtifactStatus.Draft, ToolArtifactStatus.Rejected].includes(tool.status)) {
      throw new Error('Only draft or rejected tool artifacts can be edited');
    }

    // editable fields
    if (body.name !== undefined) tool.name = body.name;
    if (body.description !== undefined) tool.description = body.description;

    if (body.version !== undefined) tool.version = body.version;
    if (body.runtime !== undefined) tool.runtime = body.runtime as any;

    if (body.sourceType !== undefined) tool.sourceType = body.sourceType as any;

    // implementation (keep consistent with sourceType)
    if (tool.sourceType === ToolSourceType.InlineCode) {
      if (body.code !== undefined) tool.code = body.code ?? '';
      tool.artifactRef = null;
      if (body.artifactRef !== undefined && body.artifactRef) {
        // ignore or throw; je choisis ignore pour être safe
      }
    } else {
      if (body.artifactRef !== undefined) tool.artifactRef = body.artifactRef ?? '';
      tool.code = null;
      if (body.code !== undefined && body.code) {
        // ignore or throw
      }
    }

    if (body.inputSchema !== undefined) tool.inputSchema = body.inputSchema ?? null;
    if (body.outputSchema !== undefined) tool.outputSchema = body.outputSchema ?? null;

    if (body.permissionsRequested !== undefined)
      tool.permissionsRequested = body.permissionsRequested ?? [];
    if (body.limits !== undefined) tool.limits = body.limits ?? null;
    if (body.env !== undefined) tool.env = body.env ?? [];
    if (body.sandboxPolicy !== undefined) tool.sandboxPolicy = body.sandboxPolicy ?? null;

    if (body.visibility !== undefined) tool.visibility = body.visibility as any;

    // ✅ recompute hash after update
    tool.contentHash = computeToolContentHash({
      runtime: tool.runtime,
      sourceType: tool.sourceType,
      version: tool.version,
      code: tool.code,
      artifactRef: tool.artifactRef,
      limits: tool.limits,
      env: tool.env,
      permissionsRequested: tool.permissionsRequested,
      inputSchema: tool.inputSchema,
      outputSchema: tool.outputSchema,
      sandboxPolicy: tool.sandboxPolicy,
    });

    const saved = await api?.DSave(tool);

    await audit(api, e, {
      type: AuditEventType.AGENT_UPDATED,
      orgId,
      resourceType: 'ToolArtifact',
      resourceId: saved?.id ?? null,
      metadata: { name: saved?.name, version: saved?.version, contentHash: saved?.contentHash },
    });

    e.out.send({ toolArtifact: saved });
  };
};

// ---------------------------
// SUBMIT
// ---------------------------
export const submitToolArtifactBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const { toolArtifactId } = ToolArtifactIdParams.parse(e.in.params);

    const { orgId, userId } = await getOrgAndUser(e);
    if (!orgId || !userId) throw new Error('Unauthorized');

    const tool = await repo?.DGet1<ToolArtifact>(ToolArtifact, { where: { id: toolArtifactId } });
    if (!tool) throw new Error('ToolArtifact not found');
    if (tool.publisherOrgId !== orgId) throw new Error('Forbidden');

    if (![ToolArtifactStatus.Draft, ToolArtifactStatus.Rejected].includes(tool.status)) {
      throw new Error('Only draft/rejected can be submitted');
    }

    tool.status = ToolArtifactStatus.Submitted;

    const saved = await api?.DSave(tool);

    await audit(api, e, {
      type: AuditEventType.AGENT_SUBMITTED,
      orgId,
      resourceType: 'ToolArtifact',
      resourceId: saved?.id ?? null,
      metadata: { name: saved?.name, version: saved?.version },
    });

    e.out.send({ toolArtifact: saved });
  };
};

// ---------------------------
// APPROVE (admin)
// ---------------------------
export const approveToolArtifactBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const { toolArtifactId } = ToolArtifactIdParams.parse(e.in.params);
    const body = ApproveToolArtifactBody.parse(e.in.body ?? {});

    if (!e.in.payload?.isAdmin) throw new Error('Admin required');

    const tool = await repo?.DGet1<ToolArtifact>(ToolArtifact, { where: { id: toolArtifactId } });
    if (!tool) throw new Error('ToolArtifact not found');
    if (tool.status !== ToolArtifactStatus.Submitted)
      throw new Error('Only submitted can be approved');

    tool.status = ToolArtifactStatus.Approved;
    tool.approvedAt = new Date();
    tool.approvedByUserId = e.in.payload?.id ?? null;

    if (body.publish) {
      tool.visibility = ToolVisibility.Unlisted;
      tool.publishedAt = new Date();
    }

    const saved = await api?.DSave(tool);

    await audit(api, e, {
      type: AuditEventType.AGENT_APPROVED,
      orgId: saved?.publisherOrgId ?? null,
      resourceType: 'ToolArtifact',
      resourceId: saved?.id ?? null,
      metadata: { name: saved?.name, version: saved?.version, publish: body.publish },
    });

    e.out.send({ toolArtifact: saved });
  };
};

// ---------------------------
// REJECT (admin)
// ---------------------------
export const rejectToolArtifactBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const { toolArtifactId } = ToolArtifactIdParams.parse(e.in.params);
    const { reason } = RejectToolArtifactBody.parse(e.in.body ?? {});

    if (!e.in.payload?.isAdmin) throw new Error('Admin required');

    const tool = await repo?.DGet1<ToolArtifact>(ToolArtifact, { where: { id: toolArtifactId } });
    if (!tool) throw new Error('ToolArtifact not found');
    if (tool.status !== ToolArtifactStatus.Submitted)
      throw new Error('Only submitted can be rejected');

    tool.status = ToolArtifactStatus.Rejected;
    tool.rejectionReason = clampStr(reason, 2000);

    const saved = await api?.DSave(tool);

    await audit(api, e, {
      type: AuditEventType.AGENT_REJECTED,
      orgId: saved?.publisherOrgId ?? null,
      resourceType: 'ToolArtifact',
      resourceId: saved?.id ?? null,
      metadata: { reason: clampStr(reason, 500) },
    });

    e.out.send({ toolArtifact: saved });
  };
};

// ---------------------------
// GET
// ---------------------------
export const getToolArtifactBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const { toolArtifactId } = ToolArtifactIdParams.parse(e.in.params);

    const tool = await repo?.DGet1<ToolArtifact>(ToolArtifact, { where: { id: toolArtifactId } });
    if (!tool) throw new Error('ToolArtifact not found');

    const resp: DResponse<ToolArtifact> = {
      status: 200,
      data: tool,
    };

    e.out.send(resp);
  };
};

// ---------------------------
// LIST (org library)
// ---------------------------
export const listToolArtifactsBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();

    const { orgId, userId } = await getOrgAndUser(e);
    if (!orgId || !userId) throw new Error('Unauthorized');

    const tools = await repo?.DGetAll<ToolArtifact>(ToolArtifact, {
      where: { publisherOrgId: orgId },
      order: { created_at: 'DESC' as any },
      take: 200,
    });

    e.out.send({ toolArtifacts: tools ?? [] });
  };
};
