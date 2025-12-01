// policies/rules.ts

import { Policy } from "@Damba/policies/v1";
import { DEvent } from "@Damba/service/v1/DambaService";

export const must_have_org_access: Policy = async (e:DEvent) => {
  const orgId = e.in.payload?.orgId;
  if (!orgId) return { ok: false, status: 403, code: "ORG_CONTEXT_MISSING", message: "Missing organization context" };
  return { ok: true };
};

export const must_be_admin: Policy = (e: DEvent) => {
  const roles: string[] = e.in.payload?.roles ?? [];
  if (!roles.includes("admin")) {
    return { ok: false, status: 403, code: "ADMIN_REQUIRED", message: "Admin role required" };
  }
  return { ok: true };
};

