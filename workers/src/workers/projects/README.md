# create_project Worker

BullMQ background job that takes a user prompt, calls an LLM to generate a full Damba project architecture, and persists everything to PostgreSQL.

## How it works

The worker receives a job with the user's prompt and tenant context. It uses LangChain (ChatPromptTemplate + Zod parsing) to call the LLM at each level of the hierarchy, validates the structured output, and saves every artifact to the database via `DambaRepository`.

Every component (application, module, service, entity, extra, behavior, validator) gets an associated `CodeFile` with generated source code, stored in a single table with `DStereotype` to categorize them.

Progress events are emitted at each step via `job.updateProgress()`, routed through Socket.io to the client using `requestId`.

### Build status transitions

```
INITIALIZING → IN_PROGRESS → COMPLETED
                            → FAILED (on error)
```

## Pipeline

The worker builds the hierarchy for the DEV application in this order:

| Step | pct  | What                                    | Entity saved                             |
|------|------|-----------------------------------------|------------------------------------------|
| 1    | 10%  | Project                                 | `Project`                                |
| 2    | 10%  | Applications (one per env)              | `Application`                            |
| 3    | 10%  | Global Middlewares                       | `Middleware`                              |
| 4    | 20%  | Modules                                 | `Modules`                                |
| 5    | 30%  | App-level files                         | `CodeFile` (APPLICATION)                 |
| 6    | 40%  | Services per module + module index.ts   | `AppServices` + `CodeFile` (SERVICE, MODULE) |
| 7    | 55%  | Entities per service                    | `Entities` + `CodeFile` (ENTITY)         |
| 8    | 65%  | Global Validators (reusable Zod schemas)| `Validators` + `CodeFile` (CONFIG)       |
| 9    | 95%  | Extras + Behaviors per service          | `Extra`, `Extra_Hook`, `Behavior`, `Policy`, `Middleware`, `BehaviorConfigValidator` + `CodeFile` (EXTRA, BEHAVIOR) |
| 10   | 100% | Done                                    | —                                        |

## Generated hierarchy

```
Project
└── Application (DEV, QA, STAGING, PROD)
    │
    ├── CodeFile[] ─ stereotype: APPLICATION
    │   ├── index.ts
    │   ├── tsconfig.json
    │   ├── package.json
    │   ├── .env.example
    │   ├── Dockerfile
    │   └── .gitignore
    │
    ├── Middleware[] ─ global reusable (AuthGuard, Logger, RateLimiter...)
    │
    ├── Validator[] ─ global reusable Zod schemas (CreateUserSchema, PaginationQuerySchema...)
    │   └── CodeFile ─ stereotype: CONFIG  (/src/validators/{name}.ts)
    │
    └── Module[]
        ├── CodeFile ─ stereotype: MODULE
        │   └── index.ts (exports IServiceProvider with spread services)
        │
        └── AppService[]
            ├── CodeFile ─ stereotype: SERVICE  ({name}.ts)
            │
            ├── Entity[]
            │   └── CodeFile ─ stereotype: ENTITY  ({name}.ts)
            │
            ├── Extra[]
            │   ├── Extra_Hook[] ─ integrations (Stripe, AWS, Mailing...)
            │   └── CodeFile ─ stereotype: EXTRA  ({name}.ts)
            │
            └── Behavior[] ─ endpoints (GET /users/:id, POST /auth/login...)
                ├── CodeFile ─ stereotype: BEHAVIOR  ({name}.ts)
                ├── Policy[]
                │   └── Middleware[] ─ reuses global or creates new
                └── BehaviorConfigValidator
                    ├── body     → Validator (reuses global)
                    ├── query    → Validator (reuses global)
                    ├── params   → Validator (reuses global)
                    └── response → Validator (reuses global)
```

## Key files

| File | Purpose |
|------|---------|
| `processors/index.ts` | Main processor — orchestrates the job, manages build status |
| `processors/buildHierarchy.ts` | Builds the full hierarchy for one application |
| `processors/saver.ts` | All save/persist functions, CodeFile generators, and helpers |
| `dtos.ts` | `JobData` and `JobResult` type definitions |

## LLM utilities

Located in `workers/src/workers/LmmUtils/`:

| File | Purpose |
|------|---------|
| `HierarchyPrompts.ts` | System prompts for each hierarchy level |
| `HierarchySchemas.ts` | Zod schemas for validating LLM responses |
| `HierarchyRLambdas.ts` | LangChain `RunnableLambda` parsers |
| `index.ts` | `callLLMFor*` functions (one per hierarchy level) |

## Job payload

```typescript
interface JobData {
  prompt: string;          // User's project description
  userId: string;          // Who triggered it
  tenantId: string;        // Organization ID
  newRequestId?: string;   // Socket routing ID
}
```

## CodeFile stereotypes

All generated source files are stored in the `CodeFile` entity (`codeFile` table) using `DStereotype`:

| Stereotype    | What it contains |
|---------------|------------------|
| `APPLICATION` | App root files (index.ts, tsconfig, package.json, Dockerfile...) |
| `MODULE`      | Module index.ts exporting `IServiceProvider` |
| `SERVICE`     | Service definition with `createService()` |
| `ENTITY`      | TypeORM entity class with columns |
| `EXTRA`       | Hook/integration code |
| `BEHAVIOR`    | Route handler (endpoint) |
| `CONFIG`      | Validator — reusable Zod schema |
