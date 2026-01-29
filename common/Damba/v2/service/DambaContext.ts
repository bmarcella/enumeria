/* eslint-disable @typescript-eslint/no-explicit-any */

import { DEvent } from "./DEvent";
import { ServiceConfig } from "../../v1/service/ServiceConfig";
import { AsyncLocalStorage } from "async_hooks";
import { IDActionConfig } from "./IServiceDamba";

export interface DambaExecutionContext<REQ, RES, NEXT> {
  event: DEvent<REQ, RES, NEXT>;
  serviceName: string;
  simpleServiceName: string;
  entity?: new (...args: any[]) => any;
  config: ServiceConfig<REQ, RES, NEXT>;
  middleware?: ((de: DEvent<REQ, RES, NEXT>) => any)[],
  routeConfig: IDActionConfig,
  meta?: Record<string, any>;
  state?: Record<string, any>;
}

const storage = new AsyncLocalStorage<DambaExecutionContext<any, any, any>>();

export const DambaContext = {

  run<REQ, RES, NEXT>(
    ctx: DambaExecutionContext<REQ, RES, NEXT>,
    fn: () => any
  ) {
    return storage.run(ctx as any, fn);
  },

  get<REQ, RES, NEXT>(): DambaExecutionContext<REQ, RES, NEXT> | undefined {
    return storage.getStore() as
      | DambaExecutionContext<REQ, RES, NEXT>
      | undefined;
  },

  require<REQ, RES, NEXT>(): DambaExecutionContext<REQ, RES, NEXT> {
    const ctx = storage.getStore() as DambaExecutionContext<REQ, RES, NEXT> | undefined;
    if (!ctx) {
      throw new Error(
        "DambaContext not available. You are calling a Damba helper outside a request pipeline."
      );
    }
    return ctx;
  },

  getEvent<REQ, RES, NEXT>(): DEvent<REQ, RES, NEXT> | undefined {
    const ctx = storage.getStore() as
      | DambaExecutionContext<REQ, RES, NEXT>
      | undefined;
    return ctx?.event;
  },
  // Convenience accessors (great for policies/validators)
  req<REQ = any>(): REQ {
    return this.require<REQ, any, any>().event.in as any;
  },

  res<RES = any>(): RES {
    return this.require<any, RES, any>().event.out as any;
  },

  next<NEXT = any>(): NEXT {
    return this.require<any, any, NEXT>().event.go as any;
  },

  // State helpers
  getState<T = any>(key: string): T | undefined {
    const ctx = this.require();
    return (ctx.state ?? {})[key] as T | undefined;
  },

  setState(key: string, value: any) {
    const ctx = this.require();
    ctx.state = { ...(ctx.state ?? {}), [key]: value };
  },

  patchState(obj: Record<string, any>) {
    const ctx = this.require();
    ctx.state = { ...(ctx.state ?? {}), ...(obj ?? {}) };
  },

};
