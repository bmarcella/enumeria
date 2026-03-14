/* ============================================================================
 * Damba Agent Marketplace — TypeORM Entities (TypeScript)
 * - Designed for PostgreSQL
 * - TypeORM 0.3.x style
 * - Keep enums + jsonb fields for flexible schemas (inputsSchema, patches, etc.)
 * ========================================================================== */

import {
  Entity,
  Column,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from "typeorm";
import { AgentManifest } from "../../../../common/Damba/core/AgentDefType";
import { BaseModel } from "./BaseModel";


/** ---------------------------------------------------------------------------
 * Enums
 * ------------------------------------------------------------------------- */

export enum AgentRoleType {
  Developer = "Developer",
  SubjectExpert = "SubjectExpert",
  ProductManager = "ProductManager",
  QAEngineer = "QAEngineer",
  Designer = "Designer",
  Architect = "Architect",
  BizOperations = "BizOperations",
}

export enum AgentColor {
  Blue = "Blue",
  Cyan = "Cyan",
  Orange = "Orange",
  Yellow = "Yellow",
  Pink = "Pink",
  Purple = "Purple",
  Green = "Green",
}

export enum AgentExecutionMode {
  Studio = "studio",
  Runtime = "runtime",
  Both = "both",
}

export enum AgentDefinitionStatus {
  Draft = "draft",
  Submitted = "submitted",
  Approved = "approved",
  Rejected = "rejected",
  Delisted = "delisted",
}

export enum ListingVisibility {
  Public = "public",
  Unlisted = "unlisted",
}

export enum PriceType {
  Free = "free",
  OneTime = "one_time",
  Subscription = "subscription", // future
}

export enum PurchaseProvider {
  Manual = "manual",
  Stripe = "stripe", // future
}

export enum PurchaseStatus {
  Pending = "pending",
  Paid = "paid",
  Failed = "failed",
  Refunded = "refunded",
}

export enum LicenseType {
  OrgWide = "org_wide",
  SeatBased = "seat_based", // future
  ProjectBased = "project_based", // future
}

export enum LicenseStatus {
  Active = "active",
  Revoked = "revoked",
}

export enum ScopeType {
  Project = "project",
  Application = "application",
  Module = "module",
  Service = "service",
  Behavior = "behavior",
}

export enum RunStatus {
  Queued = "queued",
  Running = "running",
  Succeeded = "succeeded",
  Failed = "failed",
  Canceled = "canceled",
}

export enum RunTrigger {
  Manual = "manual",
  OnAnalyze = "onAnalyze",
  OnValidate = "onValidate",
  OnGenerate = "onGenerate",
}

export enum ProposalType {
  AstPatch = "ast_patch",
  JsonPatch = "json_patch",
}

export enum ProposalStatus {
  Proposed = "proposed",
  Accepted = "accepted",
  Rejected = "rejected",
  Superseded = "superseded",
}


/** ---------------------------------------------------------------------------
 * AgentDefinition
 * ------------------------------------------------------------------------- */
@Entity({ name: "agent_definitions" })
@Index(["publisherOrgId", "status"])
export class AgentDefinition extends BaseModel {
  @Column({ type: "varchar", length: 120 })
  name!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "enum", enum: AgentRoleType })
  roleType!: AgentRoleType;

  @Column({ type: "varchar", length: 12 })
  emoji!: string;

  @Column({ type: "enum", enum: AgentColor })
  color!: AgentColor;

  // semver string e.g. "1.2.0"
  @Column({ type: "varchar", length: 32 })
  version!: string;

  @Column({
    type: "enum",
    enum: AgentExecutionMode,
    default: AgentExecutionMode.Studio,
  })
  executionMode!: AgentExecutionMode;

  @Column({ type: "uuid" })
  publisherOrgId!: string;

  @Column({ type: "uuid" })
  publisherUserId!: string;

  // Supported attachment scopes: ["project","module",...]
  @Column({ type: "jsonb", default: () => "'[]'::jsonb" })
  scopes!: ScopeType[];

  // e.g. ["analyze","proposeDiff"]
  @Column({ type: "jsonb", default: () => "'[]'::jsonb" })
  capabilities!: string[];

  // e.g. ["architecture.read","architecture.proposeChanges"]
  @Column({ type: "jsonb", default: () => "'[]'::jsonb" })
  permissionsRequested!: string[];

  // JSON Schema for buyer assignment config validation
  @Column({ type: "jsonb", nullable: true })
  inputsSchema!: Record<string, any> | null;

  /**
   * NEW: Agent manifest (supports multi sub-agents + tool registry + execution plan).
   * Keep nullable for backward compatibility with existing rows.
   * If you want a DB-level default, set it in migration (recommended) because jsonb defaults
   * can be verbose; many teams prefer app-level defaulting.
   */
  @Column({ type: "jsonb", nullable: true })
  agentManifest!: AgentManifest | null;

  @Column({
    type: "enum",
    enum: AgentDefinitionStatus,
    default: AgentDefinitionStatus.Draft,
  })
  status!: AgentDefinitionStatus;

  // Relations
  @OneToMany(() => AgentListing, (l) => l.agentDefinition)
  listings!: AgentListing[];

  @OneToMany(() => Purchase, (p) => p.agentDefinition)
  purchases!: Purchase[];

  @OneToMany(() => License, (l) => l.agentDefinition)
  licenses!: License[];

  @OneToMany(() => AgentAssignment, (a) => a.agentDefinition)
  assignments!: AgentAssignment[];
}

/** ---------------------------------------------------------------------------
 * AgentListing (storefront)
 * ------------------------------------------------------------------------- */

@Entity({ name: "agent_listings" })
@Index(["publishedAt", "visibility", "priceType"])
export class AgentListing extends BaseModel {
  @Column({ type: "uuid" })
  agentDefinitionId!: string;

  @ManyToOne(() => AgentDefinition, (a) => a.listings, { onDelete: "CASCADE" })
  @JoinColumn({ name: "agentDefinitionId" })
  agentDefinition!: AgentDefinition;

  @Column({ type: "jsonb", default: () => "'[]'::jsonb" })
  tags!: string[];

  @Column({ type: "enum", enum: PriceType, default: PriceType.Free })
  priceType!: PriceType;

  @Column({ type: "int", default: 0 })
  priceCents!: number;

  @Column({ type: "varchar", length: 8, default: "USD" })
  currency!: string;

  @Column({ type: "enum", enum: ListingVisibility, default: ListingVisibility.Public })
  visibility!: ListingVisibility;

  @Column({ type: "timestamptz", nullable: true })
  publishedAt!: Date | null;
}

/** ---------------------------------------------------------------------------
 * Purchase
 * ------------------------------------------------------------------------- */

@Entity({ name: "agent_purchases" })
@Index(["buyerOrgId", "created_at"])
export class Purchase extends BaseModel {
  @Column({ type: "uuid" })
  buyerOrgId!: string;

  @Column({ type: "uuid" })
  agentDefinitionId!: string;

  @ManyToOne(() => AgentDefinition, (a) => a.purchases, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "agentDefinitionId" })
  agentDefinition!: AgentDefinition;

  @Column({ type: "int" })
  amountCents!: number;

  @Column({ type: "varchar", length: 8, default: "USD" })
  currency!: string;

  @Column({ type: "enum", enum: PurchaseProvider, default: PurchaseProvider.Manual })
  provider!: PurchaseProvider;

  @Column({ type: "varchar", length: 255, nullable: true })
  providerRef!: string | null;

  @Column({ type: "enum", enum: PurchaseStatus, default: PurchaseStatus.Pending })
  status!: PurchaseStatus;

  @OneToMany(() => License, (l) => l.purchase)
  licenses!: License[];

  @Column({ type: "uuid", nullable: true })
  listingId!: string | null;

  @Column({ type: "enum", enum: PriceType, nullable: true })
  priceTypeSnapshot!: PriceType | null;

  @Column({ type: "int", nullable: true })
  unitPriceCentsSnapshot!: number | null;

  @Column({ type: "int", default: 1 })
  quantity!: number;

  @Column({ type: "jsonb", nullable: true })
  metadata!: Record<string, any> | null;

}

@Entity({ name: "agent_snapshots" })
@Index(["publisherOrgId", "agentDefinitionId", "version"])
@Index(["contentHash"])
export class AgentSnapshot extends BaseModel {

  @Column({ type: "uuid" })
  agentDefinitionId!: string;

  @ManyToOne(() => AgentDefinition, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "agentDefinitionId" })
  agentDefinition!: AgentDefinition;

  @Column({ type: "uuid" })
  publisherOrgId!: string;

  @Column({ type: "varchar", length: 32 })
  version!: string;

  @Column({ type: "varchar", length: 255 })
  artifactRefSnapshot!: string;

  @Column({ type: "jsonb", nullable: true })
  manifestSnapshot!: AgentManifest | null;

  @Column({ type: "jsonb", nullable: true })
  toolsSnapshot!: Record<string, any> | null;

  @Column({ type: "varchar", length: 64 })
  contentHash!: string;
}

/** ---------------------------------------------------------------------------
 * License (org owns/installed agent)
 * ------------------------------------------------------------------------- */

@Entity({ name: "agent_licenses" })
@Index(["buyerOrgId", "status"])
@Unique("uq_active_license_per_org_agent", ["buyerOrgId", "agentDefinitionId", "status"])
export class License extends BaseModel {
  @Column({ type: "uuid" })
  buyerOrgId!: string;

  @Column({ type: "uuid" })
  agentDefinitionId!: string;

  @ManyToOne(() => AgentDefinition, (a) => a.licenses, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "agentDefinitionId" })
  agentDefinition!: AgentDefinition;

  @Column({ type: "uuid", nullable: true })
  purchaseId!: string | null;

  @ManyToOne(() => Purchase, (p) => p.licenses, { onDelete: "SET NULL" })
  @JoinColumn({ name: "purchaseId" })
  purchase!: Purchase | null;

  @Column({ type: "enum", enum: LicenseType, default: LicenseType.OrgWide })
  licenseType!: LicenseType;

  @Column({ type: "enum", enum: LicenseStatus, default: LicenseStatus.Active })
  status!: LicenseStatus;

  @Column({ type: "timestamptz", nullable: true })
  activatedAt!: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  revokedAt!: Date | null;

  @OneToMany(() => AgentAssignment, (a) => a.license)
  assignments!: AgentAssignment[];

  @Column({ type: "uuid", nullable: true })
  agentSnapshotId!: string | null;

  @ManyToOne(() => AgentSnapshot, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "agentSnapshotId" })
  agentSnapshot!: AgentSnapshot | null;

  @Column({ type: "varchar", length: 64, nullable: true })
  agentContentHashSnapshot!: string | null;
}

/** ---------------------------------------------------------------------------
 * AgentAssignment (bind to Project/App/Module/Service/Behavior)
 * ------------------------------------------------------------------------- */

@Entity({ name: "agent_assignments" })
@Index(["buyerOrgId", "scopeType", "scopeId"])
export class AgentAssignment extends BaseModel {
  @Column({ type: "uuid" })
  buyerOrgId!: string;

  @Column({ type: "uuid" })
  agentDefinitionId!: string;

  @ManyToOne(() => AgentDefinition, (a) => a.assignments, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "agentDefinitionId" })
  agentDefinition!: AgentDefinition;

  @Column({ type: "uuid" })
  licenseId!: string;

  @ManyToOne(() => License, (l) => l.assignments, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "licenseId" })
  license!: License;

  @Column({ type: "enum", enum: ScopeType })
  scopeType!: ScopeType;

  @Column({ type: "uuid" })
  scopeId!: string;

  @Column({ type: "boolean", default: true })
  enabled!: boolean;

  // Validated against AgentDefinition.inputsSchema
  @Column({ type: "jsonb", default: () => "'{}'::jsonb" })
  config!: Record<string, any>;

  // MVP: ["manual"]; later: onAnalyze/onValidate/onGenerate
  @Column({ type: "jsonb", default: () => "'[\"manual\"]'::jsonb" })
  triggers!: RunTrigger[];

  @Column({ type: "uuid" })
  createdByUserId!: string;

  @OneToMany(() => AgentRun, (r) => r.assignment)
  runs!: AgentRun[];

  @Column({ type: "uuid" })
  agentSnapshotId!: string;

  @ManyToOne(() => AgentSnapshot, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "agentSnapshotId" })
  agentSnapshot!: AgentSnapshot;

  @Column({ type: "jsonb", default: () => "'[]'::jsonb" })
  permissionsGranted!: string[];
}

/** ---------------------------------------------------------------------------
 * AgentRun (invocation record)
 * ------------------------------------------------------------------------- */

@Entity({ name: "agent_runs" })
@Index(["assignmentId", "created_at"])
export class AgentRun extends BaseModel {
  @Column({ type: "uuid" })
  buyerOrgId!: string;

  @Column({ type: "uuid" })
  assignmentId!: string;

  @ManyToOne(() => AgentAssignment, (a) => a.runs, { onDelete: "CASCADE" })
  @JoinColumn({ name: "assignmentId" })
  assignment!: AgentAssignment;

  @Column({ type: "enum", enum: RunStatus, default: RunStatus.Queued })
  status!: RunStatus;

  @Column({ type: "timestamptz", nullable: true })
  startedAt!: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  endedAt!: Date | null;

  @Column({ type: "enum", enum: RunTrigger, default: RunTrigger.Manual })
  trigger!: RunTrigger;

  // Snapshot: { architectureAst, config, scope }
  @Column({ type: "jsonb" })
  inputSnapshot!: Record<string, any>;

  @Column({ type: "text", nullable: true })
  outputSummary!: string | null;

  @Column({ type: "text", nullable: true })
  error!: string | null;

  @OneToMany(() => AgentProposal, (p) => p.run)
  proposals!: AgentProposal[];

  @Column({ type: "uuid" })
  agentSnapshotId!: string;
 
  @ManyToOne(() => AgentSnapshot, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "agentSnapshotId" })
  agentSnapshot!: AgentSnapshot;

  @Column({ type: "varchar", length: 64 })
  contentHashSnapshot!: string;

  @Column({ type: "enum", enum: ScopeType })
  scopeType!: ScopeType;

  @Column({ type: "uuid" })
  scopeId!: string;

  @Column({ type: "uuid", nullable: true })
  correlationId!: string | null;
}

/** ---------------------------------------------------------------------------
 * AgentProposal (diff output)
 * ------------------------------------------------------------------------- */

@Entity({ name: "agent_proposals" })
@Index(["runId", "status"])
export class AgentProposal extends BaseModel {
  @Column({ type: "uuid" })
  runId!: string;

  @ManyToOne(() => AgentRun, (r) => r.proposals, { onDelete: "CASCADE" })
  @JoinColumn({ name: "runId" })
  run!: AgentRun;

  @Column({ type: "enum", enum: ProposalType, default: ProposalType.AstPatch })
  type!: ProposalType;

  @Column({ type: "jsonb" })
  patch!: Record<string, any>;

  @Column({ type: "jsonb", nullable: true })
  filesAffected!: Record<string, any> | null;

  @Column({ type: "enum", enum: ProposalStatus, default: ProposalStatus.Proposed })
  status!: ProposalStatus;

  @Column({ type: "uuid", nullable: true })
  decidedByUserId!: string | null;

  @Column({ type: "timestamptz", nullable: true })
  decidedAt!: Date | null;
}


