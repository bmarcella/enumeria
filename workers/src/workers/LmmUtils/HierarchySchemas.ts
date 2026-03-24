// LmmUtils/HierarchySchemas.ts
import { z } from 'zod';

// ── Applications ──────────────────────────────────────────────────────────────
export const ApplicationItemSchema = z.object({
  name: z.string().min(1),
  type_app: z.enum(['ui', 'web', 'mobile', 'api', 'cli', 'library', 'daemon', 'worker', 'microservice']),
  description: z.string().min(1),
});
export const ApplicationsResponseSchema = z.object({
  applications: z.array(ApplicationItemSchema).min(1),
});
export type ApplicationsResponse = z.infer<typeof ApplicationsResponseSchema>;

// ── Modules ───────────────────────────────────────────────────────────────────
export const ModuleItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});
export const ModulesResponseSchema = z.object({
  modules: z.array(ModuleItemSchema).min(1),
});
export type ModulesResponse = z.infer<typeof ModulesResponseSchema>;

// ── Entities (Domain Models) ──────────────────────────────────────────────────
export const EntityFieldSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1), // e.g., string, number, boolean, Date
  required: z.boolean().default(true),
});
export const EntityItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  fields: z.array(EntityFieldSchema).min(1),
});
export const EntitiesResponseSchema = z.object({
  entities: z.array(EntityItemSchema).min(1),
});
export type EntitiesResponse = z.infer<typeof EntitiesResponseSchema>;

// ── Services ──────────────────────────────────────────────────────────────────
export const CrudConfigSchema = z.object({
  create: z.boolean().default(true),
  read: z.boolean().default(true),
  update: z.boolean().default(true),
  delete: z.boolean().default(true),
});
export const ServiceItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  defaultEntity: z.string().min(1),
  crudConfig: CrudConfigSchema,
});
export const ServicesResponseSchema = z.object({
  services: z.array(ServiceItemSchema).min(1),
});
export type ServicesResponse = z.infer<typeof ServicesResponseSchema>;

// ── Extras & Hooks ────────────────────────────────────────────────────────────
export const ExtraHookSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  inputs: z.record(z.unknown()).default({}),
  outputs: z.record(z.unknown()).default({}),
  type: z.string().min(1), // trigger, action, etc.
});
export const ExtraItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  isContextNeeded: z.boolean().default(true),
  hooks: z.array(ExtraHookSchema).default([]),
});
export const ExtrasResponseSchema = z.object({
  extras: z.array(ExtraItemSchema).min(1),
});
export type ExtrasResponse = z.infer<typeof ExtrasResponseSchema>;

// ── Validators (per behavior) ─────────────────────────────────────────────────
export const JsonSchemaSchema = z.record(z.unknown()).default({});

// ── Middlewares ───────────────────────────────────────────────────────────────
export const MiddlewareItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});
export const MiddlewaresResponseSchema = z.object({
  middlewares: z.array(MiddlewareItemSchema).min(1),
});
export type MiddlewaresResponse = z.infer<typeof MiddlewaresResponseSchema>;

// ── Policies ──────────────────────────────────────────────────────────────────
export const PolicyItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  middlewares: z.array(MiddlewareItemSchema).min(1),
});
export const PoliciesResponseSchema = z.object({
  policies: z.array(PolicyItemSchema).min(1),
});
export type PoliciesResponse = z.infer<typeof PoliciesResponseSchema>;

// ── Behaviors (includes policies & validators) ────────────────────────────────
export const BehaviorItemSchema = z.object({
  name: z.string().min(1),
  path: z.string().startsWith('/'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
  description: z.string().min(1),
  inputValidator: JsonSchemaSchema,
  outputValidator: JsonSchemaSchema,
  policies: z.array(PolicyItemSchema).default([]),
});
export const BehaviorsResponseSchema = z.object({
  behaviors: z.array(BehaviorItemSchema).min(1),
});
export type BehaviorsResponse = z.infer<typeof BehaviorsResponseSchema>;

export type BehaviorItem = z.infer<typeof BehaviorItemSchema>;
export type PolicyItem = z.infer<typeof PolicyItemSchema>;
export type MiddlewareItem = z.infer<typeof MiddlewareItemSchema>;
export type EntityItem = z.infer<typeof EntityItemSchema>;
export type ExtraItem = z.infer<typeof ExtraItemSchema>;
export type ExtraHook = z.infer<typeof ExtraHookSchema>;
