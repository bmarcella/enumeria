// core/QueuesBull.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { AsyncLocalStorage } from "node:async_hooks";
import { QueueEventsHandlers } from "./QueueService";
import type { DambaApi } from "./DambaService";
import { RegistryContext } from "../Registry/RegistryContext";

type BullConn = any; // ioredis instance or compatible

export type QCtor<T> = new (
  name: string,
  opts: {
    connection: BullConn;
    defaultJobOptions?: any;
    prefix?: string;
    autorun?: boolean;
    streams?: any;
  }
) => T;

function assertCtor<T>(
  Ctor: QCtor<T> | undefined | null,
  label: string
): asserts Ctor is QCtor<T> {
  if (!Ctor) throw new Error(`${label} is required`);
}

/**
 * Context stored per async call chain.
 * - keyPrefix: used to namespace queues (multi-tenant / per-request scope)
 * - correlationId: optional, useful for logs/metrics
 */
export type QueueContext = {
  keyPrefix?: string;
  correlationId?: string;
};

const queueALS = new AsyncLocalStorage<QueueContext>();

export function getQueueContext(): QueueContext | undefined {
  return queueALS.getStore();
}

export function getKeyPrefix(fallback = "default"): string {
  return queueALS.getStore()?.keyPrefix ?? fallback;
}

/**
 * Run a function inside a queue context.
 * Use this at request boundaries (HTTP handler, message handler, cron runner, etc.).
 */
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

/**
 * Singleton registry.
 * Using globalThis makes it resilient across module duplication (monorepos, symlinks, jest, etc.).
 */
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

/**
 * Optional: if you want to ALSO avoid creating many redis connections,
 * you can cache them too. (BullMQ recommends separate connections per component,
 * but you still might want one per "prefix"/service, not per request.)
 */
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

/**
 * Provide a connection getter if you want a stable singleton connection per key.
 * If you already manage connections elsewhere, ignore this.
 */
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

function makeKey(keyPrefix: string, name: string) {
  return `${keyPrefix}:${name}`;
}

/**
 * getQueue uses ALS context keyPrefix if present.
 * You can still override by passing keyPrefix explicitly.
 */

export function getQueue<TQueue>(
  QueueClass: QCtor<TQueue>,
  name: string,
  connection: BullConn,
  ops?: any, // queue options (including defaultJobOptions)
  keyPrefix?: string
): TQueue {
  assertCtor(QueueClass, "QueueClass");

  const reg = getRegistry();
  const prefix = keyPrefix ?? getKeyPrefix("default");
  const key = makeKey(prefix, name);

  const existing = reg.queues.get(key);
  if (existing) return existing as TQueue;

  const q = new QueueClass(name, {
    connection,
    prefix, // ✅ important
    defaultJobOptions: ops ?? {}, // ✅ treat ops as queue options
  });

  reg.queues.set(key, q);
  return q;
}

/**
 * getQueueEvents wires bullmq QueueEvents once per (prefix:name).
 * IMPORTANT:
 * - Wrap QueueEvents callbacks inside BOTH:
 *    1) QueueContext ALS (runWithQueueContext)
 *    2) RegistryContext ALS (RegistryContext.run)
 * so downstream code can access RegistryContext.get().io etc.
 */
export function getQueueEvents<TQueueEvents = any>(
  QueueEventsClass: QCtor<TQueueEvents>,
  name: string,
  connection: BullConn,
  api: DambaApi,
  ev?: QueueEventsHandlers<any>
): TQueueEvents {
  assertCtor(QueueEventsClass, "QueueEventsClass");

  const reg = getRegistry();
  const prefix = ev?.prefix ?? getKeyPrefix("default");
  const key = makeKey(prefix, name);
  const streams = ev?.streams;
  const existing = reg.queueEvents.get(key);
  if (existing) return existing as TQueueEvents;
  const qe = new QueueEventsClass(name, { connection, prefix, streams }) as any;
  void qe.waitUntilReady();

  const withContexts = <T>(fn: () => Promise<T> | T) =>
    runWithQueueContext({ keyPrefix: prefix }, () =>
      RegistryContext.run({ queue: { keyPrefix: prefix } }, fn)
    );

  // completed
  const onCompleted = ev?.completed;
  if (onCompleted) {
    const lk = `${prefix}:${name}:completed`;
    if (!reg.queueListenerRegistry.has(lk)) {
      reg.queueListenerRegistry.add(lk);
      qe.on("completed", ({ jobId, returnvalue }: any) => {
        void withContexts(() =>
          onCompleted(api, { jobId: String(jobId), returnvalue })
        );
      });
    }
  }

  // failed
  const onFailed = ev?.failed;
  if (onFailed) {
    const lk = `${prefix}:${name}:failed`;
    if (!reg.queueListenerRegistry.has(lk)) {
      reg.queueListenerRegistry.add(lk);
      qe.on("failed", ({ jobId, failedReason }: any) => {
        void withContexts(() =>
          onFailed(api, { jobId: String(jobId), failedReason })
        );
      });
    }
  }

  // progress
  const onProgress = ev?.progress;
  if (onProgress) {
    const lk = `${prefix}:${name}:progress`;
    if (!reg.queueListenerRegistry.has(lk)) {
      reg.queueListenerRegistry.add(lk);
      qe.on("progress", ({ jobId, data }: any) => {
        void withContexts(() =>
          onProgress(api, { jobId: String(jobId), data })
        );
      });
    }
  }
  reg.queueEvents.set(key, qe);
  return qe;
}

// Optional for tests
export function __resetQueuesForTests() {
  const reg = getRegistry();
  reg.queues.clear();
  reg.queueEvents.clear();
  reg.queueListenerRegistry.clear();
  getConnRegistry().conns.clear();
}
