export type SameSiteOption = "lax" | "strict" | "none";

export const mustEnv = (key: string, fallback?: string): string => {
  const v = (process?.env[key] ?? fallback ?? "").trim();
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
};

export const parseBoolean = (
  value: string | undefined,
  fallback = false
): boolean => {
  if (value == null) return fallback;
  const v = value.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
};

export type AppReadyType = (
  ...args: []
) => (req: any, res: any, next: any) => void;
export type AppHelperType<T> = (
  DB: T,
  extras: any
) => (req: any, res: any, next: any) => void;

export interface AppShutdownParams<S = any, O = any> {
  name?: string;
  server?: S;
  orm?: O;
}
