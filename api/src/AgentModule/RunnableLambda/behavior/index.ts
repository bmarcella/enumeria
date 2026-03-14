/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from "crypto";
import { DEvent } from "@App/damba.import";
import { Behavior, DambaApi } from "@Damba/v2/service/DambaService";
import { audit } from "../../helper";
import { AuditEventType } from "@App/entities/agents/AuditEvent";
import {
  CreateRunnableLambdaBody,
  UpdateRunnableLambdaBody,
  RunnableLambdaIdParams,
} from "../validators";
import { RunnableLambda, RunnableLambdaStatus, RunnableLambdaVisibility } from "@App/entities/agents/ToolArtifactAndRunnableLambda";

/**
 * Hash reproductible de la lambda
 */
export function computeRunnableLambdaContentHash(payload: {
  runtime: string;
  kind: string;
  version: string;
  code: string;
  timeoutMs?: number;
  inputSchema?: Record<string, any> | null;
  outputSchema?: Record<string, any> | null;
  permissionsRequested?: string[];
}) {
  const normalized = JSON.stringify({
    runtime: payload.runtime,
    kind: payload.kind,
    version: payload.version,
    code: payload.code,
    timeoutMs: payload.timeoutMs ?? 1000,
    inputSchema: payload.inputSchema ?? null,
    outputSchema: payload.outputSchema ?? null,
    permissionsRequested: [...(payload.permissionsRequested ?? [])].sort(),
  });

  const hash = crypto.createHash("sha256").update(normalized).digest("hex");
  return `sha256:${hash}`;
}

async function getOrgAndUser(e: DEvent) {
  const userId = e.in.payload?.id ?? null;
  const config = await e.in.extras.users.getCurrentSetting(e);
  const orgId = config?.orgId ?? null;

  return { orgId, userId };
}

// ---------------------------
// CREATE
// ---------------------------
export const createRunnableLambdaBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const body = CreateRunnableLambdaBody.parse(e.in.body);

    const { orgId, userId } = await getOrgAndUser(e);
    if (!orgId || !userId) {
        return e.out.status(401).send({ message: "Unauthorized" });
    }

    const lambda = new RunnableLambda();
    lambda.name = body.name;
    lambda.description = body.description ?? "";
    lambda.version = body.version;
    lambda.runtime = body.runtime;
    lambda.kind = body.kind;
    lambda.code = body.code;
    lambda.inputSchema = body.inputSchema ?? null;
    lambda.outputSchema = body.outputSchema ?? null;
    lambda.timeoutMs = body.timeoutMs ?? 1000;
    lambda.permissionsRequested = body.permissionsRequested ?? [];

    lambda.publisherOrgId = orgId;
    lambda.publisherUserId = userId;

    lambda.status = RunnableLambdaStatus.Draft;
    lambda.visibility = body.visibility ?? RunnableLambdaVisibility.Private;

    lambda.contentHash = computeRunnableLambdaContentHash({
      runtime: lambda.runtime,
      kind: lambda.kind,
      version: lambda.version,
      code: lambda.code,
      timeoutMs: lambda.timeoutMs,
      inputSchema: lambda.inputSchema,
      outputSchema: lambda.outputSchema,
      permissionsRequested: lambda.permissionsRequested,
    });

    const saved = await api?.DSave(lambda);

    await audit(api, e, {
      type: AuditEventType.AGENT_CREATED,
      orgId,
      resourceType: "RunnableLambda",
      resourceId: saved?.id ?? null,
      metadata: {
        name: saved?.name,
        version: saved?.version,
        runtime: saved?.runtime,
        kind: saved?.kind,
        contentHash: saved?.contentHash,
      },
    });

    e.out.send({ runnableLambda: saved });
  };
};

// ---------------------------
// UPDATE
// ---------------------------
export const updateRunnableLambdaBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const { runnableLambdaId } = RunnableLambdaIdParams.parse(e.in.params);
    const body = UpdateRunnableLambdaBody.parse(e.in.body);

    const { orgId, userId } = await getOrgAndUser(e);
    if (!orgId || !userId) throw new Error("Unauthorized");

    const lambda = await repo?.DGet1<RunnableLambda>(RunnableLambda, {
      where: { id: runnableLambdaId },
    });

    if (!lambda) throw new Error("RunnableLambda not found");
    if (lambda.publisherOrgId !== orgId) throw new Error("Forbidden");

    if (
      ![RunnableLambdaStatus.Draft, RunnableLambdaStatus.Rejected].includes(
        lambda.status
      )
    ) {
      throw new Error("Only draft or rejected runnable lambdas can be edited");
    }

    if (body.name !== undefined) lambda.name = body.name;
    if (body.description !== undefined) lambda.description = body.description ?? "";
    if (body.version !== undefined) lambda.version = body.version;
    if (body.runtime !== undefined) lambda.runtime = body.runtime;
    if (body.kind !== undefined) lambda.kind = body.kind;
    if (body.code !== undefined) lambda.code = body.code;
    if (body.inputSchema !== undefined) lambda.inputSchema = body.inputSchema ?? null;
    if (body.outputSchema !== undefined) lambda.outputSchema = body.outputSchema ?? null;
    if (body.timeoutMs !== undefined) lambda.timeoutMs = body.timeoutMs ?? 1000;
    if (body.permissionsRequested !== undefined) {
      lambda.permissionsRequested = body.permissionsRequested ?? [];
    }
    if (body.visibility !== undefined) {
      lambda.visibility = body.visibility;
    }

    lambda.contentHash = computeRunnableLambdaContentHash({
      runtime: lambda.runtime,
      kind: lambda.kind,
      version: lambda.version,
      code: lambda.code,
      timeoutMs: lambda.timeoutMs,
      inputSchema: lambda.inputSchema,
      outputSchema: lambda.outputSchema,
      permissionsRequested: lambda.permissionsRequested,
    });

    const saved = await api?.DSave(lambda);

    await audit(api, e, {
      type: AuditEventType.AGENT_UPDATED,
      orgId,
      resourceType: "RunnableLambda",
      resourceId: saved?.id ?? null,
      metadata: {
        name: saved?.name,
        version: saved?.version,
        contentHash: saved?.contentHash,
      },
    });

    e.out.send({ runnableLambda: saved });
  };
};

// ---------------------------
// DELETE
// ---------------------------
export const deleteRunnableLambdaBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const { runnableLambdaId } = RunnableLambdaIdParams.parse(e.in.params);

    const { orgId, userId } = await getOrgAndUser(e);
    if (!orgId || !userId) throw new Error("Unauthorized");

    const lambda = await repo?.DGet1<RunnableLambda>(RunnableLambda, {
      where: { id: runnableLambdaId },
    });

    if (!lambda) throw new Error("RunnableLambda not found");
    if (lambda.publisherOrgId !== orgId) throw new Error("Forbidden");

    if (
      ![RunnableLambdaStatus.Draft, RunnableLambdaStatus.Rejected].includes(
        lambda.status
      )
    ) {
      throw new Error("Only draft or rejected runnable lambdas can be deleted");
    }

    await repo?.DDelete?.(RunnableLambda, { id: runnableLambdaId });

    await audit(api, e, {
      type: AuditEventType.AGENT_REJECTED,
      orgId,
      resourceType: "RunnableLambda",
      resourceId: runnableLambdaId,
      metadata: {
        deleted: true,
        name: lambda.name,
        version: lambda.version,
      },
    });

    e.out.send({
      message: "RunnableLambda deleted successfully",
      runnableLambdaId,
    });
  };
};

// ---------------------------
// GET
// ---------------------------
export const getRunnableLambdaBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const { runnableLambdaId } = RunnableLambdaIdParams.parse(e.in.params);

    const lambda = await repo?.DGet1<RunnableLambda>(RunnableLambda, {
      where: { id: runnableLambdaId },
    });

    if (!lambda) throw new Error("RunnableLambda not found");

    e.out.send({ runnableLambda: lambda });
  };
};

// ---------------------------
// LIST
// ---------------------------
export const listRunnableLambdasBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();

    const { orgId, userId } = await getOrgAndUser(e);
    if (!orgId || !userId) throw new Error("Unauthorized");

    const lambdas = await repo?.DGetAll<RunnableLambda>(RunnableLambda, {
      where: { publisherOrgId: orgId },
      order: { created_at: "DESC" as any },
      take: 200,
    });

    e.out.send({ runnableLambdas: lambdas ?? [] });
  };
};