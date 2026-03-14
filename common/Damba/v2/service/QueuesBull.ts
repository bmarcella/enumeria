// core/QueuesBull.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import crypto from "crypto";
import { AsyncLocalStorage } from "node:async_hooks";
import type { QueueEventsHandlers } from "./QueueService";
import type { DambaApi } from "./DambaService";
import { RegistryContext } from "../Registry/RegistryContext";

/**
 * Factory type for creating a fresh dedicated ioredis connection.
 * Must be provided so QueueEvents gets its own connection — sharing is not safe.
 */
export type RedisConnectionFactory = () => BullConn;

type BullConn = any; // ioredis instance or compatible

// -----------------------------------------------------------------------------
// Sharding helpers (optional)
// -----------------------------------------------------------------------------
export function shardForTenant(tenantId: string, shardCount = 128) {
  const h = crypto.createHash("sha1").update(tenantId).digest();
  const n = h.readUInt32BE(0);
  return n % shardCount;
}

export function shardQueueName(
  baseName: string,
  tenantId: string,
  shardCount = 128
) {
  const shard = shardForTenant(tenantId, shardCount);
  return `${baseName}_${shard}`;
}

// -----------------------------------------------------------------------------
// BullMQ constructors
// -----------------------------------------------------------------------------
export type QCtor<T> = new (
  name: string,
  opts: {
    connection: BullConn;
    prefix?: string;
    defaultJobOptions?: any;
    autorun?: boolean;
    streams?: any; // QueueEvents supports streams; Queue ignores it (safe to pass only in QueueEvents)
    [k: string]: any;
  }
) => T;

function assertCtor<T>(
  Ctor: QCtor<T> | undefined | null,
  label: string
): asserts Ctor is QCtor<T> {
  if (!Ctor) throw new Error(`${label} is required`);
}

// -----------------------------------------------------------------------------
// AsyncLocalStorage context: per-request / per-message
// -----------------------------------------------------------------------------
export type QueueContext = {
  keyPrefix?: string; // multi-tenant namespace
  correlationId?: string; // trace id, optional
};

const queueALS = new AsyncLocalStorage<QueueContext>();

export function getQueueContext(): QueueContext | undefined {
  return queueALS.getStore();
}

export function getKeyPrefix(fallback = "default"): string {
  return queueALS.getStore()?.keyPrefix ?? fallback;
}

export async function runWithQueueContext<T>(
  ctx: QueueContext,
  fn: () => Promise<T> | T
): Promise<T> {
  return await new Promise<T>((resolve, reject) => {
    queueALS.run(ctx, async () => {
      try {
        resolve(await fn());
      } catch (e) {
        reject(e);
      }
    });
  });
}

// -----------------------------------------------------------------------------
// Global registry: resilient to monorepo duplication, jest, symlinks...
// -----------------------------------------------------------------------------
type Registry = {
  queues: Map<string, unknown>;
  queueEvents: Map<string, unknown>;
  queueListenerRegistry: Set<string>;
};

const GLOBAL_KEY = "__damba_bullmq_registry__";

function getRegistry(): Registry {
  const g = globalThis as any;
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = {
      queues: new Map<string, unknown>(),
      queueEvents: new Map<string, unknown>(),
      queueListenerRegistry: new Set<string>(),
    } satisfies Registry;
  }
  return g[GLOBAL_KEY] as Registry;
}

// Optional connection registry (only if you want)
type ConnRegistry = {
  conns: Map<string, BullConn>;
};

const CONN_GLOBAL_KEY = "__damba_bullmq_conn_registry__";

function getConnRegistry(): ConnRegistry {
  const g = globalThis as any;
  if (!g[CONN_GLOBAL_KEY])
    g[CONN_GLOBAL_KEY] = { conns: new Map<string, BullConn>() };
  return g[CONN_GLOBAL_KEY] as ConnRegistry;
}

export function getSingletonConnection(
  key: string,
  factory: () => BullConn
): BullConn {
  const reg = getConnRegistry();
  const existing = reg.conns.get(key);
  if (existing) return existing;
  const conn = factory();
  reg.conns.set(key, conn);
  return conn;
}

// -----------------------------------------------------------------------------
// Key helpers
// -----------------------------------------------------------------------------
function normalizePrefix(p?: string) {
  const x = String(p ?? "").trim();
  return x.length ? x : undefined;
}

function makeKey(prefix: string | undefined, name: string) {
  return prefix ? `${prefix}:${name}` : name;
}

function makeListenerKey(
  prefix: string | undefined,
  name: string,
  ev: "completed" | "failed" | "progress"
) {
  return prefix ? `${prefix}:${name}:${ev}` : `${name}:${ev}`;
}

// -----------------------------------------------------------------------------
// Options shapes
// -----------------------------------------------------------------------------
export type GetQueueOptions = {
  prefixEnabled?: boolean; // default false
  keyPrefix?: string; // override ALS prefix (only if prefixEnabled)
  queueOptions?: any; // extra queue ctor options
  defaultJobOptions?: any; // bullmq defaultJobOptions
};

export type GetQueueEventsOptions = {
  prefixEnabled?: boolean; // default false
  keyPrefix?: string; // override ALS prefix (only if prefixEnabled)
  streams?: any; // QueueEvents streams option (optional)
  queueEventsOptions?: any; // extra QueueEvents ctor options
};

// -----------------------------------------------------------------------------
// Helpers: extract context from QueueEvents payload
// IMPORTANT: QueueEvents callback runs OUTSIDE request ALS.
// So we rebuild tenant/correlation from returnvalue/progress data when possible.
// -----------------------------------------------------------------------------
function tryParseJson(x: any) {
  if (x == null) return null;
  if (typeof x === "object") return x;
  if (typeof x !== "string") return null;
  const s = x.trim();
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

/**
 * Try to infer tenant/correlation from:
 * - progress data (job.updateProgress payload)
 * - returnvalue (job result)
 * - failedReason if you encode JSON into it (optional)
 */
function extractQueueContextFromEventPayload(
  payload: any,
  fallbackPrefix?: string
): QueueContext {
  const obj = tryParseJson(payload) ?? payload ?? {};

  // Accept multiple conventions:
  // - { keyPrefix, correlationId }
  // - { tenantId } (then keyPrefix = tenantId)
  // - { tenant }   (then keyPrefix = tenant)
  // - { meta: { keyPrefix, correlationId } }
  // - { stereotype: { ... } } (your IWorkerMeta had stereotype:any)
  const meta =
    obj?.meta ??
    obj?.metadata ??
    obj?.workerMeta ??
    obj?.stereotype ??
    obj?.ctx ??
    {};

  const keyPrefix =
    normalizePrefix(obj?.keyPrefix) ??
    normalizePrefix(meta?.keyPrefix) ??
    normalizePrefix(obj?.tenantId) ??
    normalizePrefix(meta?.tenantId) ??
    normalizePrefix(obj?.tenant) ??
    normalizePrefix(meta?.tenant) ??
    normalizePrefix(fallbackPrefix) ??
    "default";

  const correlationId =
    normalizePrefix(obj?.correlationId) ??
    normalizePrefix(meta?.correlationId) ??
    normalizePrefix(obj?.request_id) ??
    normalizePrefix(meta?.request_id) ??
    undefined;

  return { keyPrefix, correlationId };
}

// -----------------------------------------------------------------------------
// getQueue
// -----------------------------------------------------------------------------
export function getQueue<TQueue>(
  QueueClass: QCtor<TQueue>,
  name: string,
  connection: BullConn,
  opts: GetQueueOptions = {},
    /** REQUIRED: factory that returns a fresh ioredis connection. Each QueueEvents MUST have its own. */
  connectionFactory?: RedisConnectionFactory
): TQueue {
  assertCtor(QueueClass, "QueueClass");

  const reg = getRegistry();

  const prefixEnabled = Boolean(opts.prefixEnabled);
  const prefix = prefixEnabled
    ? normalizePrefix(opts.keyPrefix ?? getKeyPrefix("default"))
    : undefined;

  const key = makeKey(prefix, name);
  const existing = reg.queues.get(key);
  if (existing) return existing as TQueue;

   // BullMQ QueueEvents holds a blocking subscribe-style connection.
  // It MUST have its own dedicated connection — never share with Queue or other QueueEvents.
  const dedicatedConn = connectionFactory
    ? connectionFactory()
    : (typeof connection.duplicate === "function" ? connection.duplicate() : connection);

  const q = new QueueClass(name, {
    connection: dedicatedConn,
    ...(prefix ? { prefix } : {}),
    ...(opts.queueOptions ?? {}),
    ...(opts.defaultJobOptions
      ? { defaultJobOptions: opts.defaultJobOptions }
      : {}),
  });

  reg.queues.set(key, q);
  console.log(`[QueuesBull] Registered queue: ${key}`);
  return q;
}

// -----------------------------------------------------------------------------
// getQueueEvents (wires handlers once per (prefix:name))
// -----------------------------------------------------------------------------
export function getQueueEvents<TQueueEvents = any>(
  QueueEventsClass: QCtor<TQueueEvents>,
  name: string,
  connection: BullConn,
  api: DambaApi,
  handlers?: QueueEventsHandlers<any>,
  opts: GetQueueEventsOptions = {},
  /** REQUIRED: factory that returns a fresh ioredis connection. Each QueueEvents MUST have its own. */
  connectionFactory?: RedisConnectionFactory
): TQueueEvents {
  assertCtor(QueueEventsClass, "QueueEventsClass");

  const reg = getRegistry();

  const prefixEnabled = Boolean(opts.prefixEnabled);
  const prefix = prefixEnabled
    ? normalizePrefix(opts.keyPrefix ?? getKeyPrefix("default"))
    : undefined;

  const key = makeKey(prefix, name);
  const existing = reg.queueEvents.get(key);
  if (existing) return existing as TQueueEvents;

  // BullMQ QueueEvents holds a blocking subscribe-style connection.
  // It MUST have its own dedicated connection — never share with Queue or other QueueEvents.
  const dedicatedConn = connectionFactory
    ? connectionFactory()
    : (typeof connection.duplicate === "function" ? connection.duplicate() : connection);

  const qe = new QueueEventsClass(name, {
    connection: dedicatedConn,
    ...(prefix ? { prefix } : {}),
    ...(opts.streams ? { streams: opts.streams } : {}),
    ...(opts.queueEventsOptions ?? {}),
  }) as any;

  if (typeof qe.waitUntilReady === "function") {
    void qe.waitUntilReady();
  }

  /**
   * Wrap any handler with BOTH contexts:
   * - Queue ALS: so getKeyPrefix/getQueueContext work
   * - Registry ALS: so RegistryContext.get().io etc. work
   */
  const withContexts = <T>(ctx: QueueContext, fn: () => Promise<T> | T) => {
    return runWithQueueContext(ctx, () =>
      RegistryContext.run({ queue: ctx }, fn)
    );
  };

  // completed
  if (handlers?.completed) {
    const lk = makeListenerKey(prefix, name, "completed");
    if (!reg.queueListenerRegistry.has(lk)) {
      reg.queueListenerRegistry.add(lk);

      qe.on("completed", ({ jobId, returnvalue }: any) => {
        const ctx = extractQueueContextFromEventPayload(returnvalue, prefix);
        void withContexts(ctx, () =>
          handlers.completed!(api, { jobId: String(jobId), returnvalue })
        );
      });
    }
  }

  // failed
  if (handlers?.failed) {
    const lk = makeListenerKey(prefix, name, "failed");
    if (!reg.queueListenerRegistry.has(lk)) {
      reg.queueListenerRegistry.add(lk);

      qe.on("failed", ({ jobId, failedReason }: any) => {
        const ctx = extractQueueContextFromEventPayload(failedReason, prefix);
        void withContexts(ctx, () =>
          handlers.failed!(api, { jobId: String(jobId), failedReason })
        );
      });
    }
  }

  // progress
  if (handlers?.progress) {
    const lk = makeListenerKey(prefix, name, "progress");
    if (!reg.queueListenerRegistry.has(lk)) {
      reg.queueListenerRegistry.add(lk);

      qe.on("progress", ({ jobId, data }: any) => {
        const ctx = extractQueueContextFromEventPayload(data, prefix);
        void withContexts(ctx, () =>
          handlers.progress!(api, { jobId: String(jobId), data })
        );
      });
    }
  }

  reg.queueEvents.set(key, qe);
  console.log(`[QueuesBull] Registered handlers for queue events: ${key}`);
  return qe;
}

// -----------------------------------------------------------------------------
// Test helpers
// -----------------------------------------------------------------------------
export function __resetQueuesForTests() {
  const reg = getRegistry();
  reg.queues.clear();
  reg.queueEvents.clear();
  reg.queueListenerRegistry.clear();
  getConnRegistry().conns.clear();
}
