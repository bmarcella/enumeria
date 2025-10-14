
import { CanvasBox, VisibilityTypeClass } from "./CanvasBox";
import { VisibilityTypeAttributes, RelationshipType } from "./CanvasBoxAtributes";
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
  id: string;
  name: string;
  description?: string;

  // Ownership & metadata
  ownerId?: string;
  contributors?: Contributor[];
  tags?: string[];
  status?: ServiceStatus;
  config?: Config<ServiceCanvasSetting>;

  // Code & runtime
  kind?: ServiceKind; // 'api', 'worker', etc.
  language?: string;  // 'typescript', 'python', 'go', ...
  runtime?: string;   // 'node18', 'python3.11', 'go1.22', ...
  framework?: string; // 'express', 'nest', 'fastapi', ...
  version?: string;   // '1.2.0'

  // Source & package
  repoUrl?: string;    // Git repo
  packageName?: string; // npm/repo package id

  // Contracts & I/O
  endpoint?: string;   // base URL if kind==='api'
  openapiUrl?: string; // OpenAPI spec
  grpcProto?: string;  // proto path/ref
  docsUrl?: string;    // internal docs

  // Events & messaging
  eventsEmitted?: string[];  // event names
  eventsConsumed?: string[];
  queues?: string[];         // queue names
  topics?: string[];         // pub/sub topics

  // Infra & execution
  ports?: number[];          // exposed ports
  environment?: "dev" | "staging" | "prod";
  envVars?: Record<string, string | number | boolean>;
  secrets?: string[];        // names/keys, not values
  databaseIds?: string[];    // links to datastore resources
  externalDeps?: string[];   // HTTP/gRPC dependencies (service ids or URLs)
  scaling?: { min?: number; max?: number; targetCPU?: number };
  resources?: { cpu?: string; memory?: string }; // e.g. '500m', '256Mi'
  schedule?: string;         // cron expr if kind==='cron'
  timeoutMs?: number;
  retries?: number;

  // Ops & SRE
  healthUrl?: string;
  uptimeSla?: string;        // '99.9%'
  telemetry?: {
    logs?: string;           // logger/stream id
    metrics?: string;        // dashboard id
    traces?: string;         // tracing service name
    alertPolicyId?: string;
  };

  // Linkage (optional flat reference in addition to nesting)
  moduleId?: string;

  // Your entity diagrams for this service
  canvasBoxes: CanvasBox[];
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
  modules: AppModule[];
  config?: Config<AppCanvasSetting>;
  type?: "web" | "mobile" | "api" | "cli" | "library";
  runtime?: string;
  language?: string;
  version?: string;

  ownerId?: string;
  contributors?: Contributor[];
  dependencies?: string[];
  environments?: Environments;
  tags?: string[];
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
  environments?: Environments;
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


export const FakeProject: Project[] = [{
  id: 'proj_hr',
  name: 'HR Platform',
  key: 'HR',
  slug: 'hr-platform',
  description: 'Employee records, payroll, attendance.',
  status: 'active',
  priority: 'high',
  ownerId: 'user_123',
  contributors: [
    { id: 'user_123', name: 'Alice Johnson', role: 'Project Owner' },
    { id: 'user_124', name: 'Bob Smith', role: 'Backend' }
  ],
  tags: ['internal', 'platform'],
  environments: { dev: 'dev.hr.local', prod: 'hr.example.com' },
  repoUrls: ['https://github.com/acme/monorepo'],
  docsUrl: 'https://docs.example.com/projects/hr',
  issueTracker: { system: 'linear', projectKey: 'HR' },
  ci: { pipelineUrl: 'https://ci.example.com/pipelines/hr' },
  kpis: ['OnboardingTime<2d', 'PayrollAccuracy=99.9%'],
  config: {
    canvas: {
      showGrid: true
    }
  },
  applications: [
    {
      id: "app_001",
      name: "HR Management",
      description: "Handles employee records, attendance, and payroll operations.",
      type: "web",
      language: "typescript",
      runtime: "node18",
      version: "1.0.0",
      ownerId: "user_123",
      contributors: [
        { id: "user_123", name: "Alice Johnson", role: "Lead Developer" },
        { id: "user_124", name: "Bob Smith", role: "Backend Engineer" }
      ],
      dependencies: ["Payroll API"],
      tags: ["HR", "internal", "monorepo"],
      environments: {
        dev: "https://dev.hr.example.com",
        staging: "https://staging.hr.example.com",
        prod: "https://hr.example.com"
      },
      modules: [
        {
          id: "mod_01",
          name: "Employee Management",
          description: "Handles employee creation, updates, and basic HR logic.",
          type: "feature",
          version: "1.0.0",
          status: "active",
          ownerId: "user_123",
          contributors: [
            { id: "user_123", name: "Alice Johnson", role: "Module Owner" }
          ],
          dependencies: ["shared-utils"],
          repoPath: "apps/hr/modules/employee",
          packageName: "@monkata/hr-employee",
          environments: {
            dev: "https://dev.hr.example.com/employee",
            prod: "https://hr.example.com/employee"
          },
          services: [
            {
              id: 'svc_payroll_api',
              name: 'Payroll API',
              kind: 'api',
              language: 'typescript',
              runtime: 'node18',
              framework: 'nest',
              version: '1.3.0',
              endpoint: 'https://api.example.com/payroll',
              openapiUrl: 'https://api.example.com/payroll/openapi.json',
              eventsEmitted: ['invoice.created', 'payout.requested'],
              eventsConsumed: ['employee.updated'],
              queues: ['payroll-jobs'],
              topics: ['hr-events'],
              databaseIds: ['db_payroll'],
              externalDeps: ['svc_auth', 'svc_ledger'],
              scaling: { min: 1, max: 5, targetCPU: 70 },
              resources: { cpu: '500m', memory: '512Mi' },
              telemetry: { logs: 'log/payroll', metrics: 'dash/payroll', traces: 'svc-payroll' },
              status: 'active',
              canvasBoxes: [
                {
                  id: "0a03",
                  entityName: "Employee",
                  attributes: [
                    {
                      name: "id",
                      type: TypeAttbutesTypeOrm.UUID,
                      id: '1',
                      visibility: VisibilityTypeAttributes.IMPLEMENTATION,
                      isMapped: false
                    },
                    {
                      name: "lastName",
                      type: TypeAttbutesTypeOrm.VARCHAR,
                      id: '4',
                      visibility: VisibilityTypeAttributes.PROTECTED,
                      isMapped: false
                    },
                    {
                      name: "firstName",
                      type: TypeAttbutesTypeOrm.VARCHAR,
                      id: '5',
                      visibility: VisibilityTypeAttributes.PROTECTED,
                      isMapped: false
                    },
                    {
                      name: "adresses",
                      type: "0a04",
                      id: '3',
                      visibility: VisibilityTypeAttributes.PUBLIC,
                      isMapped: true,
                      relation: {
                        type: RelationshipType.ONE_TO_MANY,
                        targetEntity: "0a04",
                        targetEntityAttribute: "3"
                      }
                    },
                    {
                      name: "email",
                      type: TypeAttbutesTypeOrm.VARCHAR,
                      id: '6',
                      visibility: VisibilityTypeAttributes.PROTECTED,
                      isMapped: false
                    },
                    {
                      name: "password",
                      type: TypeAttbutesTypeOrm.VARCHAR,
                      id: '7',
                      visibility: VisibilityTypeAttributes.PROTECTED,
                      isMapped: false
                    },

                    {
                      name: "age",
                      type: TypeAttbutesTypeOrm.INT,
                      id: '2',
                      visibility: VisibilityTypeAttributes.PRIVATE,
                      isMapped: false
                    },


                  ],
                  visibility: VisibilityTypeClass.PUBLIC
                },
                {
                  id: "0a04",
                  entityName: "Address",
                  attributes: [
                    {
                      name: "id",
                      type: TypeAttbutesTypeOrm.UUID,
                      id: '1',
                      visibility: VisibilityTypeAttributes.PUBLIC,
                      isMapped: false
                    },
                    {
                      name: "city",
                      type: TypeAttbutesTypeOrm.INT,
                      id: '2',
                      visibility: VisibilityTypeAttributes.IMPLEMENTATION,
                      isMapped: true
                    },
                    {
                      name: "Employee",
                      type: "0a03",
                      id: '3',
                      visibility: VisibilityTypeAttributes.IMPLEMENTATION,
                      isMapped: false,
                      relation: {
                        type: RelationshipType.MANY_TO_ONE,
                        targetEntity: "0a03",
                        targetEntityAttribute: "3"
                      }
                    }
                  ],
                  visibility: VisibilityTypeClass.PUBLIC
                }
                ,
                {
                  id: "0a05",
                  entityName: "Users",
                  attributes: [
                    {
                      name: "id",
                      type: TypeAttbutesTypeOrm.UUID,
                      id: '1',
                      visibility: VisibilityTypeAttributes.PUBLIC,
                      isMapped: false
                    },
                    {
                      name: "Username",
                      type: TypeAttbutesTypeOrm.TEXT,
                      id: '2',
                      visibility: VisibilityTypeAttributes.IMPLEMENTATION,
                      isMapped: false
                    },
                    {
                      name: "Password",
                      type: TypeAttbutesTypeOrm.VARCHAR,
                      id: '3',
                      visibility: VisibilityTypeAttributes.IMPLEMENTATION,
                      isMapped: false
                    }
                  ],
                  visibility: VisibilityTypeClass.PUBLIC
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}];


export const FakeOrg: Organization[] = [{
  id: 'org_001',
  name: 'Damba Labs',
  slug: 'damba-labs',
  plan: 'pro',
  visibility: 'internal',
  timezone: 'America/Toronto',
  domains: [{ domain: 'damba.dev', verified: true }],
  ownerId: 'user_123',
  members: [
    { userId: 'user_123', role: 'owner', displayName: 'Alice Johnson' },
    { userId: 'user_124', role: 'maintainer', displayName: 'Bob Smith' },
  ],
  integrations: { githubOrg: 'damba-labs' },
  config: { canvas: { showGrid: true } },
  created_at: new Date('2025-09-20T14:32:00Z'),
  projects: FakeProject
}];