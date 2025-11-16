// damba/policies.ts

import { DEvent } from "../service/DambaService";

/** A policy returns:
 *  - nothing / { ok: true }  → pass
 *  - { ok: false, status?, message?, code? } → fail (short-circuit)
 */
export type PolicyResult =
  | { ok: true }
  | { ok: false; status?: number; message?: string; code?: string };

export type Policy = (e: DEvent) => void | PolicyResult | Promise<void | PolicyResult>;

/**
 * Run policies in order. Short-circuits on first failure or if response was sent.
 * You can call this INSIDE a behavior.
 */
export async function applyPolicies(e: DEvent, ...policies: Policy[]): Promise<void> {
  for (const policy of policies) {
    const out = await policy(e);

    // If a policy already sent a response, stop the pipeline.
    if (e.out.headersSent) return;

    // Normalize the result
    if (out && "ok" in out && out.ok === false) {
      const status = out.status ?? 403;
      const body = {
        ok: false,
        code: out.code ?? "POLICY_VIOLATION",
        message: out.message ?? "Policy check failed",
      };
      e.out.status(status).json(body);
      return;
    }
  }
}

/**
 * Compose many policies into ONE Damba-style middleware (DEvent => any),
 * so you can attach it at service-level or behavior-level in `createBehaviors`.
 */
export function policyMiddleware(...policies: Policy[]) {
  return async (e: DEvent) => {
    await applyPolicies(e, ...policies);
    // If a policy already sent a response, DON'T continue to next handler.
    if (e.out.headersSent) return;
    // otherwise fall through (i.e., let the next handler run)
  };
}

/**
 * Optional helpers: require ALL / ANY policies to pass, as a single middleware.
 */
export function allPolicies(...policies: Policy[]) {
  return policyMiddleware(...policies);
}

export function anyPolicy(...policies: Policy[]) {
  // succeed if at least one policy passes
  return async (e: DEvent) => {
    let lastError: PolicyResult | undefined;

    for (const p of policies) {
      const out = await p(e);
      if (e.out.headersSent) return; // someone responded; stop

      // treat undefined / {ok:true} as success
      if (!out || (("ok" in out) && out.ok === true)) return;
      // otherwise remember the failure and try the next policy
      lastError = out as PolicyResult;
    }

    // if none passed, emit the last error (or a default)
    const err = lastError ?? { ok: false, status: 403, message: "All policies failed" };

    if (err.ok === false) {
      e.out.status(err.status ?? 403).json({
        ok: false,
        code: err.code ?? "POLICY_ANY_FAILED",
        message: err.message ?? "Policy check failed",
      });
    } else {
      e.out.status(403).json({
        ok: false,
        code: "POLICY_ANY_FAILED",
        message: "Policy check failed",
      });
    }

  };
}
