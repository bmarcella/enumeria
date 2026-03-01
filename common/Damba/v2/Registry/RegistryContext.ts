// core/RegistryContext.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AsyncLocalStorage } from "node:async_hooks";
import { getQueueContext, QueueContext } from "../service/QueuesBull";

export type RegistryContextStore = {
  // Queue context (multi-tenant)
  queue?: QueueContext;

  // Socket registry
  io?: any;              // socket.io server
  dambaIo?: any;         // DambaIOApp
  clients?: Map<string, Set<any>>; // request_id -> sockets
  sockets?: any[];       // connected sockets

  // Any other registries
  registries?: Record<string, any>;
};

const regALS = new AsyncLocalStorage<RegistryContextStore>();

function mergeStores(a: RegistryContextStore, b: Partial<RegistryContextStore>): RegistryContextStore {
  return {
    ...a,
    ...b,
    // shallow-merge nested maps/registries as needed
    queue: b.queue ?? a.queue,
    registries: { ...(a.registries ?? {}), ...(b.registries ?? {}) },
  };
}

export class RegistryContext {

  static get(): RegistryContextStore {
    // If registry context missing, still expose queue context (best DX)
    const store = regALS.getStore();
    if (store) return store;
    return { queue: getQueueContext() };
  }

  static require<K extends keyof RegistryContextStore>(key: K): NonNullable<RegistryContextStore[K]> {
    const v = this.get()[key];
    if (v == null) throw new Error(`RegistryContext missing: ${String(key)}`);
    return v as any;
  }

  static run<T>(patch: Partial<RegistryContextStore>, fn: () => T): T {
    const current = this.get();
    const merged = mergeStores(current, patch);
    return regALS.run(merged, fn);
  }

  static set(patch: Partial<RegistryContextStore>) {
    const store = regALS.getStore();
    if (!store) throw new Error("RegistryContext not available (not running inside ALS)");
    const merged = mergeStores(store, patch);
    Object.assign(store, merged);
  }

  // Convenience helpers
  static tenant(fallback = "default") {
    return this.get().queue?.keyPrefix ?? fallback;
  }

  static correlationId() {
    return this.get().queue?.correlationId;
  }
  
}