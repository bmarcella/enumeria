export type ExtrasMap = Record<string, any>

export const normalizePath = (p?: string) => {
  if (!p || p === '/') return '/';
  // strip leading slashes then re-add one
  const clean = p.replace(/^\/+/, '');
  return `/${clean}`;
};

export const toArray = <T>(m?: T | T[]) => (Array.isArray(m) ? m : m ? [m] : []);

export const asyncWrap = (fn: (req: any, res: any, next: any) => any) =>
  <REQ, RES, NEXT>(req: REQ, res: RES, next: NEXT) =>
    Promise.resolve(fn(req, res, next)).catch(next as any);

export const makeExtrasMiddleware = (extras: any, name: string, routeExtras?: any) => {
  const incoming = routeExtras ?? {};
  const existing = extras?.[name] ?? {}
  return {
    ...extras,
    [name]: { ...existing, ...incoming }
  };
}

export const addZodValidator = (mws: any[], which: "body" | "params" | "query", schema: any) => {
  if (!schema?.safeParse) return;
  mws.push((req: any, res: any, next: any) => {
    const result = schema.safeParse(req[which]);
    if (!result.success) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        where: which,
        details: result.error.flatten(),
      });
    }
    req[which] = result.data;
    return next();
  });
};