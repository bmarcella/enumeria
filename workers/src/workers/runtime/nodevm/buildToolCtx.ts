/* eslint-disable @typescript-eslint/no-explicit-any */

// ../runtime/buildToolCtx.ts
/**
 * Build a SAFE execution context for tools.
 * The tool code should not have direct access to network/fs/db.
 * It can only use methods you expose here, and you enforce permissions.
 */
export function buildToolCtx(params: {
  orgId: string;
  userId?: string;
  projectId?: string;

  scopeType?: string;
  scopeId?: string;

  correlationId: string;
  permissionsGranted: string[];

  /**
   * Optional allowlists / limits
   */
  http?: {
    allowedHosts?: string[]; // e.g. ["api.github.com", "example.com"]
    timeoutMs?: number; // default 8000
  };
}) {
  const can = (perm: string) => params.permissionsGranted.includes(perm);

  const allowedHosts = params.http?.allowedHosts ?? [];
  const httpTimeoutMs = params.http?.timeoutMs ?? 8000;

  const assertAllowedUrl = (urlStr: string) => {
    if (allowedHosts.length === 0) return; // allow all if empty (MVP)
    const u = new URL(urlStr);
    if (!allowedHosts.includes(u.host)) {
      throw new Error(`http.fetch blocked: host "${u.host}" not in allowlist`);
    }
  };

  return {
    meta: {
      orgId: params.orgId,
      userId: params.userId ?? null,
      projectId: params.projectId ?? null,
      scopeType: params.scopeType ?? null,
      scopeId: params.scopeId ?? null,
      correlationId: params.correlationId,
    },

    permissions: [...params.permissionsGranted],

    /**
     * Tools/APIs exposed to user code.
     * Add more here over time (qdrant, damba read, propose patch, etc.)
     */
    tools: {
      httpFetch: async (url: string, init?: RequestInit) => {
        if (!can('http.fetch')) throw new Error('Permission denied: http.fetch');
        assertAllowedUrl(url);

        // Node 18+ has global fetch
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), httpTimeoutMs);

        try {
          const res = await fetch(url, {
            ...init,
            signal: controller.signal,
          });

          const text = await res.text();
          return {
            status: res.status,
            ok: res.ok,
            headers: Object.fromEntries(res.headers.entries()),
            body: text,
          };
        } finally {
          clearTimeout(t);
        }
      },

      /**
       * Example: you can wire these to your internal services
       */
      dambaArchitectureRead: async (query: any) => {
        if (!can('architecture.read')) throw new Error('Permission denied: architecture.read');
        // TODO: call your internal Damba service layer here
        return { ok: true, data: null, query };
      },

      dambaProposePatch: async (patch: any) => {
        if (!can('architecture.proposeChanges'))
          throw new Error('Permission denied: architecture.proposeChanges');
        // TODO: call your internal patch proposal endpoint here
        return { ok: true, patchId: null, patch };
      },
    },
  };
}
