// core/RegistryContext.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AsyncLocalStorage } from "node:async_hooks";
import type { QueueContext } from "../service/QueuesBull";
import { getQueueContext } from "../service/QueuesBull";

export type RegistryContextStore = {
  // Queue context (multi-tenant)
  queue?: QueueContext;
  // Socket registry
  io?: any; // socket.io server
  dambaIo?: any; // DambaIOApp
  clients?: Map<string, Set<any>>; // request_id -> sockets
  sockets?: any[]; // connected sockets

  // Generic registries
  registries?: Record<string, any>;
};

const regALS = new AsyncLocalStorage<RegistryContextStore>();

function baseStore(): RegistryContextStore {
  // If RegistryContext isn't set, still expose QueueContext (DX)
  const q = getQueueContext();
  return q ? { queue: q } : {};
}

function mergeStores(
  a: RegistryContextStore,
  b: Partial<RegistryContextStore>
): RegistryContextStore {
  return {
    ...a,
    ...b,
    // stable rule: explicit patch wins; registries are shallow-merged
    queue: b.queue ?? a.queue,
    registries: { ...(a.registries ?? {}), ...(b.registries ?? {}) },
  };
}

export class RegistryContext {
  static get(): RegistryContextStore {
    return regALS.getStore() ?? baseStore();
  }

  static require<K extends keyof RegistryContextStore>(
    key: K
  ): NonNullable<RegistryContextStore[K]> {
    const v = this.get()[key];
    if (v == null) throw new Error(`RegistryContext missing: ${String(key)}`);
    return v as any;
  }

  static run<T>(
    patch: Partial<RegistryContextStore>,
    fn: () => Promise<T> | T
  ): Promise<T> | T {
    const current = regALS.getStore() ?? baseStore();
    const merged = mergeStores(current, patch);
    return regALS.run(merged, fn as any);
  }

  /**
   * ⚠️ Avoid mutating ALS store in-place in most cases.
   * If you really need "set", restrict it to registries only.
   */
  static setRegistry(key: string, value: any) {
    const store = regALS.getStore();
    if (!store)
      throw new Error("RegistryContext not available (not inside ALS)");

    store.registries = store.registries ?? {};
    store.registries[key] = value;
  }

  // Convenience helpers
  static tenant(fallback = "default") {
    return this.get().queue?.keyPrefix ?? fallback;
  }

  static correlationId() {
    return this.get().queue?.correlationId;
  }
}
