# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### API (backend)
```bash
cd api
npm run dev          # Start dev server with hot reload
npm run build        # TypeScript compile + Docker build
npm run test         # Run Jest tests (Jest + ts-jest)
npm run format       # Prettier format
npm run format:check # Check formatting without writing
```

### Workers (BullMQ background jobs)
Workers run from `api/` (same package.json):
```bash
cd api
npm run workers                      # Run all 4 workers concurrently
npm run worker:run-agent             # AI agent execution
npm run worker:create-project        # Project creation
npm run worker:delete-project        # Project deletion
npm run worker:create-project-pipeline  # Project pipeline
```

### UI (React frontend)
```bash
cd ui/damba
npm run dev       # Vite dev server
npm run build     # Production build
npm run format    # Prettier + ESLint fix
```

### CLI scaffolding tool
```bash
cd DambaCli
npm run dev   # Run CLI
npm run build # Compile TypeScript
```

### Launch all services (Windows)
```bash
./launch.bat          # Starts Redis (Docker), API, Workers, and UI
./launch.bat api      # Start only API
./launch.bat workers  # Start only workers
./launch.bat stop     # Stop all services
```

### Docker services
```bash
docker-compose up redis    # Redis on port 6379
docker-compose up ollama   # Ollama LLM on port 11434
docker-compose up gitlab   # GitLab on ports 80/443/22
```

## Architecture

This is a monorepo for the **Damba framework** — an Express-based, schema-driven backend framework with AI-assisted code generation. The philosophy is: **Schemas/Models → Services → Routes → Docs**.

### Packages

| Directory | Purpose |
|-----------|---------|
| `api/` | Main Express backend. Registers all services, configures middleware, starts the server. |
| `common/Damba/v2/` | The Damba framework core. Service registry, route generation, DAO abstraction, auth, Redis, NATS, Socket.io. |
| `common/Damba/v1/` | Legacy framework internals (still used for auth). |
| `packages/database/` | TypeORM entities and DataSource initialization. All DB entities live here. |
| `packages/validators/` | Zod validation schemas shared across packages. |
| `packages/policies/` | Policies and middlewares shared across packages. |
| `ui/damba/` | React 19 + Vite + Tailwind CSS frontend. |
| `DambaCli/` | CLI scaffolding tool that creates service directory structures. |
| `AppTest/` | Integration tests. |

### TypeScript Path Aliases (api/tsconfig.json)

```
@App/*        → api/src/*
@Damba/*       → common/Damba/*
@Common/*      → common/*
@Database/*    → packages/database/src/*
@Validators/*  → packages/validators/src/*
```

### Request Flow

```
Client Request
    → Express App (Damba.start())
    → CORS, Body Parser, Session, Queue Context (tenant + correlationId)
    → Module Middleware (IModule.middleware[]) — runs for ALL services in a module
    → Service Middleware (createDambaService.middlewares[]) — runs for ALL routes in a service
    → Route Middleware (timeout, Zod validators, custom DEvent middleware)
    → Handler (DEventHandler / Behavior)
    → Response (or Error → ErrorHandler)
```

### How the API server is composed

`api/src/index.ts` calls `Damba.start()` (from `common/Damba/v2/`) with modules (e.g., `indexModule`, `AgentModule`), `AppConfig`, Google OAuth, and the TypeORM DataSource.

**Modules** group services and apply shared middleware:
```ts
export const TodoModule: IModule = {
  name: 'todos',
  services: { ...TodoService, ...TagService },
  middleware: [authorize(pubKey, jwt, ['user'])],
};
```

**Services** are created via `createDambaService({ service, behaviors, events, queues })`. Each exports an `IServiceProvider` keyed by mount path. The framework auto-generates CRUD routes from the TypeORM entity and mounts any manually declared routes.

**BehaviorHooks** define individual routes (path + method + handler + validators):
```ts
const hook = {
  '/': {
    method: Http.GET,
    behavior: getAllTodos,
    config: { validators: { body: zodSchema } },
  },
};
```

Multiple hooks are spread into a `BehaviorsChainLooper` and passed to `createDambaService`.

### Auto-Generated CRUD

When a service has an `entity`, Damba auto-generates routes at `/{service}/damba`:
- `GET /damba` — Fetch all
- `GET /damba/:id` — Fetch one
- `GET /damba/:id/:relation` — Fetch relation
- `POST /damba` — Create
- `PATCH /damba/:id` — Partial update
- `PUT /damba/:id` — Full replace
- `DELETE /damba/:id` — Delete (if enabled)

Each CRUD operation supports `before[]` and `after[]` hooks for pre/post processing.

### DAO (Data Access)

`DambaRepository` wraps TypeORM. Access via `e.in.DRepository` or `api.DRepository()`:
- `DSave`, `DGet`, `DGetAll`, `DUpdate`, `DDelete` — standard CRUD
- `DGetPage` — pagination
- `DGetWithRelations` — eager load relations
- `QueryBuilder` — TypeORM query builder
- `DSoftDelete`, `DRestore` — soft delete support
- `DQuery` — raw SQL

### Middleware injected on every request

`api/src/config/app.config.ts` sets up the request context injector, which attaches to `req`:
- `openai` — OpenAI client
- `redis` — Redis client
- `db` — TypeORM repository
- `mail` — Nodemailer service
- `tavily` — Tavily search client
- Tenant header and correlation ID for queue context propagation

### Policies

```ts
import { Policy, allPolicies, anyPolicy } from '@Damba/v2/policies';
```
Policies are async functions returning `{ ok: true }` or `{ ok: false, status, code, message }`. Compose with `allPolicies()` (AND) or `anyPolicy()` (OR) and use as route middleware.

### AsyncLocalStorage Context

`DambaContext` provides per-request state via `AsyncLocalStorage`:
- `DambaContext.require()` — get context (throws if outside request)
- `DambaContext.req()` / `DambaContext.res()` — shorthand access
- `DambaContext.setState(key, value)` / `DambaContext.getState(key)` — per-request state

### Real-Time (Socket.io) + Queues

Services can export `events` (Socket.io event handlers) and `queues` (BullMQ queue behaviors with `completed`/`progress` event handlers). Socket events can enqueue jobs and emit results back via `emitToRequest`.

### Workers

Worker scripts in `api/src/workers/` are BullMQ processors. They receive jobs from the same Redis instance. Context (tenant, correlation ID) is passed via job data headers.

### AI integration

AI agents are managed through `api/src/AgentModule/`. The stack uses LangChain orchestrating OpenAI GPT-4o-mini (cloud) and Ollama/Qwen (local models), with Tavily for web search.

### Database

TypeORM DataSource is initialized in `packages/database/src/DataSource.ts` with retry logic (8 retries, 1s delay). All entities are in `packages/database/src/entities/`. The `DambaRepository` in `common/Damba/v2/dao/` wraps TypeORM repositories.

### Error Handling

Damba v2 provides centralized error handling via `common/Damba/v2/errors/`. All errors flow through a single Express error middleware that produces consistent JSON responses.

#### Error Classes (`@Damba/v2/errors`)

| Class | Status | Default Code |
|---|---|---|
| `BadRequestError` | 400 | `BAD_REQUEST` |
| `ValidationError` | 400 | `VALIDATION_ERROR` |
| `UnauthorizedError` | 401 | `UNAUTHORIZED` |
| `ForbiddenError` | 403 | `FORBIDDEN` |
| `NotFoundError` | 404 | `NOT_FOUND` |
| `ConflictError` | 409 | `CONFLICT` |
| `UnprocessableError` | 422 | `UNPROCESSABLE_ENTITY` |
| `TooManyRequestsError` | 429 | `TOO_MANY_REQUESTS` |
| `InternalError` | 500 | `INTERNAL_ERROR` |
| `ServiceUnavailableError` | 503 | `SERVICE_UNAVAILABLE` |

All classes extend `DambaError` which carries `statusCode`, `code`, `message`, `details?`, and `isOperational` (true = expected client error, false = unexpected bug).

#### Response Format (`DambaErrorResponse`)

Every error response follows this shape:

```json
{
  "ok": false,
  "code": "NOT_FOUND",
  "message": "Item not found",
  "details": {}
}
```

The `details` field is optional and used for structured info (e.g., validation errors). In dev mode (`includeStack: true`), a `stack` field is also included.

#### Throwing Errors in Handlers

```ts
import { NotFoundError, ForbiddenError, ValidationError } from "@Damba/v2/errors";

api.DGet("/items/:id", async (e) => {
  const item = await e.in.DRepository.DGet(Entity, { where: { id: e.in.params.id } });
  if (!item) throw new NotFoundError("Item not found");
  if (!item.isPublic) throw new ForbiddenError("Access denied");
  return e.out.json(item);
});
```

Thrown errors (sync or async) are automatically caught by the framework and routed to the error handler. No need for try/catch in handlers.

#### Custom Error with Details

```ts
throw new ValidationError("Invalid input", {
  fields: { email: "must be a valid email", name: "is required" }
});
// → 400 { ok: false, code: "VALIDATION_ERROR", message: "Invalid input", details: { fields: ... } }
```

#### Configuration in `Damba.start()`

```ts
Damba.start({
  // ... other params
  errorHandler: {                          // optional — enabled by default
    includeStack: process.env.DEV === "true",  // show stack traces in dev
    logger: (err, req) => myLogger.error(err), // custom logger
    onError: (err, req) => metrics.increment("errors"), // hook for monitoring
  },
  // errorHandler: false,                  // disable entirely
});
```

#### Unmatched Routes

Requests to undefined routes automatically return:
```json
{ "ok": false, "code": "NOT_FOUND", "message": "Route not found: GET /api/unknown" }
```

#### Logging Behavior

- **Operational errors** (4xx, `isOperational: true`) log at `warn` level with a one-line summary
- **Unexpected errors** (5xx, `isOperational: false`) log at `error` level with full stack trace

### Environment flags

- `DEV=true` — enables extra debug services, looser CRUD config (all ops enabled)
- `QA` — includes reset/seed services for test data
- `STAGING` — mirrors PROD services with some restrictions
- `PROD` — restrict unnecessary operations (e.g., disable delete on critical entities)

### Key environment variables

```
NODE_ENV, PORT
DATABASE_URL
REDIS_URL
OPENAI_API_KEY, TAVILY_API_KEY
JWT_PUBLIC_KEY, JWT_PRIVATE_KEY
SMTP_USER, SMTP_PASSWORD
SESSION_SECRET, SESSION_COOKIES_SECURE
CORS_ORIGINS
DEV
```
