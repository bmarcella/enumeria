
import { CanvasBox, RelationshipType, VisibilityTypeAttributes, VisibilityTypeClass } from "./CanvasBox";
import { DambaEnvironmentType } from "./env";
import { TypeAttbutesTypeOrm } from "./TypeAttributesTypeOrm";


export type ServiceKind =
  | "api"
  | "worker"
  | "cron"
  | "realtime"
  | "integration"
  | "library";

export type ServiceStatus = "draft" | "active" | "deprecated" | "archived";

export type ProjectStatus =
  | "draft"
  | "active"
  | "on_hold"
  | "completed"
  | "archived";

export type VisibilityScope = "private" | "internal" | "public";

export interface BaseEntity {
  created_by?: string;
  created_at?: Date; // Creation date
  updated_at?: Date; // Last updated date
  deleted_at?: Date; // Deletion date
  edit?: boolean;
  view?: boolean;
  remove?: boolean;
  lock?: boolean;
  archived?: boolean;
}

export interface Contributor extends BaseEntity {
  id: string;
  name: string;
  role: string;
}

/* -------------------------------- Canvas config ------------------------------------- */

interface CanvasSetting {
  showGrid: boolean;
}

export interface ServiceCanvasSetting { }
export interface AppCanvasSetting extends CanvasSetting { }
export interface ModuleCanvasSetting extends CanvasSetting { }
export interface ProjectCanvasSetting extends CanvasSetting { }

// Generic config holder (renamed generic param to avoid shadowing)
export type Config<TCanvas> = {
  canvas: TCanvas;
};

/* -------------------------------- Common blocks ------------------------------------- */

export type Environments = {
  dev?: string;
  staging?: string;
  prod?: string;
};

/* -------------------------------- Service ------------------------------------------- */

export interface Service extends BaseEntity {
  id?: string;

  name?: string | null;
  parentId?: string | null;

  applicationId: string;
  projectId: string;
  orgId: string;

  defaultEntity?: string | null;

  crudConfig?: any;

  description?: string | null;

}


/* -------------------------------- Module -------------------------------------------- */

export interface AppModule extends BaseEntity {
  id?: string;
  name: string;
  description?: string;
  services?: Service[];
  config?: Config<ModuleCanvasSetting>;

  // Classification
  type?: "core" | "feature" | "integration" | "ui" | "infrastructure";
  version?: string;
  status?: "draft" | "active" | "deprecated" | "archived";

  // Ownership & contributors
  ownerId?: string;
  contributors?: Contributor[];
  tags?: string[];

  // Dependencies & links
  dependencies?: string[];
  externalDeps?: string[];

  // Code location
  repoPath?: string;    // monorepo-relative path
  packageName?: string; // npm/internal package name

  // Environment config
  environments?: Environments;
}

/* -------------------------------- Application --------------------------------------- */

export interface Application extends BaseEntity {
  id?: string;
  name: string;
  description?: string;
  modules: AppModule[] | [];
  config?: Config<AppCanvasSetting>;
  type?: "web" | "mobile" | "api" | "cli" | "library";
  runtime?: string;
  language?: string;
  version?: string;
  // contributors?: Contributor[];
  // dependencies?: string[];
  // tags?: string[];
}

/* -------------------------------- Project ------------------------------------------- */

export interface Project extends BaseEntity {
  id?: string;
  name: string;

  // Identity & discovery
  key?: string;    // short code like "HR"
  slug?: string;   // "hr-platform"
  description?: string;
  tags?: string[];

  // Ownership & teamwork
  ownerId?: string;
  contributors?: Contributor[];
  visibility?: VisibilityScope;

  // Lifecycle
  status?: ProjectStatus;
  priority?: "low" | "medium" | "high" | "critical";
  version?: string;
  startDate?: string; // ISO
  dueDate?: string;   // ISO

  // Execution surface
  environments?:  DambaEnvironmentType[];
  selectedEnv?: DambaEnvironmentType;
  repoUrls?: string[]; // monorepo + extra repos
  docsUrl?: string;    // main doc/home
  roadmapUrl?: string;
  issueTracker?: { system?: "linear" | "jira" | "github"; projectKey?: string };
  ci?: { pipelineUrl?: string };

  // Governance
  rbacPolicyId?: string; // link to policy doc/object
  dataClassification?: "public" | "internal" | "restricted" | "confidential";

  // Outcomes
  kpis?: string[];
  risks?: string[];
  dependencies?: string[]; // other project ids/keys

  // Children & config
  applications: Application[];
  config?: Config<ProjectCanvasSetting>;
}

/* ----------------------------- enums & types ----------------------------- */

export type OrgStatus = 'active' | 'suspended' | 'archived';
export type OrgPlan = 'free' | 'pro' | 'business' | 'enterprise'
export type OrgVisibility = 'private' | 'internal' | 'public'

export interface OrgCanvasSetting {
  /** If you render an org-level canvas (portfolio/system map) */
  showGrid?: boolean
}



export type OrgRole =
  | 'owner'
  | 'admin'
  | 'maintainer'
  | 'member'
  | 'viewer';


export interface OrgMember extends BaseEntity {
  userId: string
  role: OrgRole
  displayName?: string
  email?: string
  teams?: string[]     // ids or names of teams/squads
  tags?: string[]
}


export interface OrgDomain {
  domain: string        // e.g. "nclusion.com"
  verified?: boolean
  addedAt?: string
}

/* ------------------------------- Organization --------------------------- */

export interface Organization extends BaseEntity {
  /** Identity */
  id: string
  name: string
  key?: string               // short code, e.g., "NCL"
  slug?: string              // "nclusion"
  description?: string
  avatarUrl?: string

  /** Visibility & lifecycle */
  visibility?: OrgVisibility
  status?: OrgStatus
  plan?: OrgPlan
  trialEndsAt?: string

  /** Ownership & people */
  ownerId?: string
  contributors?: Contributor[]         // high-level maintainers
  members?: OrgMember[]                // membership roster
  defaultRole?: OrgRole                // role for newly invited users

  /** Governance & security */
  rbacPolicyId?: string                // link/id to RBAC policy doc
  dataClassification?: 'public' | 'internal' | 'restricted' | 'confidential'
  domains?: OrgDomain[]                // verified email/login domains
  ssoProvider?: 'google' | 'azuread' | 'okta' | 'github' | 'custom'
  mfaRequired?: boolean

  /** Regionalization */
  locale?: string                      // "en-US"
  timezone?: string                    // "America/Toronto"
  region?: string                      // "ca-central-1" | "us-east-1" etc.

  /** Execution surface / defaults for new projects */
  environments?: Environments
  defaultProjectTemplateId?: string
  projectNamingConvention?: 'slug' | 'key-name' | 'name-only'

  /** Integrations */
  integrations?: {
    githubOrg?: string
    gitlabGroup?: string
    linearTeamId?: string
    jiraProjectKey?: string
    slackWorkspace?: string
  }

  /** Billing (light, non-sensitive) */
  billing?: {
    customerId?: string
    currency?: string         // "USD", "CAD"
    cycle?: 'monthly' | 'yearly' | 'free'
    seats?: number
  }

  /** Org-wide tags/labels */
  tags?: string[]

  /** Children */
  projects?: Project[]

  /** UI config */
  config?: Config<OrgCanvasSetting>
}

export interface OptionType<T> {
  label: string;
  value: string | number;
  color?: string,
  data?: T,
}

export interface SimpleOptionType {
  label: string;
  value: string | number;
  color?: string
}



