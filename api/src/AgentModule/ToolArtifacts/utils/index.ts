/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from 'crypto';

/**
 * Compute a deterministic hash of what will be executed + constraints.
 * IMPORTANT:
 * - Do NOT trust client-provided contentHash.
 * - Always compute server-side from the fields that will actually be executed.
 */
export function computeToolContentHash(payload: {
  runtime: string;
  sourceType: string;
  version: string;
  code?: string | null;
  artifactRef?: string | null;
  limits?: any;
  env?: any;
  permissionsRequested?: string[];
  inputSchema?: any;
  outputSchema?: any;
  sandboxPolicy?: any;
}) {
  const normalized = JSON.stringify(
    {
      runtime: payload.runtime,
      sourceType: payload.sourceType,
      version: payload.version,

      code: payload.code ?? null,
      artifactRef: payload.artifactRef ?? null,

      limits: payload.limits ?? null,
      env: payload.env ?? [],

      permissionsRequested: payload.permissionsRequested ?? [],
      inputSchema: payload.inputSchema ?? null,
      outputSchema: payload.outputSchema ?? null,
      sandboxPolicy: payload.sandboxPolicy ?? null,
    },
    // stable-ish ordering (best effort)
    Object.keys({
      runtime: 1,
      sourceType: 1,
      version: 1,
      code: 1,
      artifactRef: 1,
      limits: 1,
      env: 1,
      permissionsRequested: 1,
      inputSchema: 1,
      outputSchema: 1,
      sandboxPolicy: 1,
    }).sort(),
  );

  const hash = crypto.createHash('sha256').update(normalized).digest('hex');
  return `sha256:${hash}`;
}
