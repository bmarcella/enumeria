import { applyPolicies } from "@Damba/policies";
import { DEvent } from "@Damba/service/DambaService";

export const defaultPolicy = async (e: DEvent) => {
  await applyPolicies(e);
  if (e.out.headersSent) return; // a policy already responded
};