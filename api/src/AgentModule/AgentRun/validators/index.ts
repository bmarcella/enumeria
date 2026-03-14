import { z } from "zod";

export const RunRequestBody = z.object({
  assignmentId: z.string().uuid(),
  /**
   * request can come from body for marketplace runs
   * (fallback to query supported)
   */
  request: z.string().optional(),
  /**
   * Optional: provide current architecture AST in the call
   * (or your runtime can load it from architecture service)
   */
  architectureAst: z.record(z.any()).optional(),
  /**
   * Optional per-run overrides (kept tight)
   */
  overrides: z
    .object({
      enableWeb: z.boolean().optional(),
      enableRag: z.boolean().optional(),
      maxResults: z.number().int().min(1).max(10).optional(),
    })
    .optional()
    .default({}),
});

export const OrgParams = z.object({
  orgId: z.string().uuid(),
});