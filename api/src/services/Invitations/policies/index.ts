// policies barrel
import { applyPolicies } from "@Damba/policies/v1";
import { DEvent } from "@Damba/service/v1/DambaService";

// policies barrel
export const defaultPolicy = async (e: DEvent) => {
  await applyPolicies(e);
  if (e.out.headersSent) return; // a policy already responded
};