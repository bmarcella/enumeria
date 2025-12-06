// policies barrel

import { DEvent } from "@App/damba.import";
import { applyPolicies } from "@Damba/v1/policies";

// policies barrel
export const defaultPolicy = async (e: DEvent) => {
  await applyPolicies(e);
  if (e.out.headersSent) return; // a policy already responded
};