/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Damba event wrapper — transport-agnostic.
 * { in: request, out: response, go: next }
 *
 * The generic defaults are `any` so the framework core
 * doesn't depend on Express types. Consumers (api/, workers/)
 * provide concrete types via their own tsconfig/augmentations.
 */
export interface DEvent<REQ = any, RES = any, NEXT = any> {
  in: REQ;
  out: RES;
  go: NEXT;
}
