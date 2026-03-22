import { applyPolicies } from "@Damba/v2/policies";
import { DEvent } from "@Damba/v2/service/DEvent";

// policies barrel
export const defaultPolicy = async (e: DEvent) => {
  await applyPolicies(e);
  if (e.out.headersSent) return; // a policy already responded
};
