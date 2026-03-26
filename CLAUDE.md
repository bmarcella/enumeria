# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### API (backend)
```bash
cd api
npm run dev          # Start dev server with hot reload
npm run build        # TypeScript compile + Docker build
npm run test         # Run Jest tests
npm run format       # Prettier format
npm run format:check # Check formatting without writing
```

### Workers (BullMQ background jobs)
```bash
cd workers
npm run workers      # Run all workers concurrently
npm run worker:create-entity
npm run worker:update-entity
npm run worker:create-project
npm run worker:run-agent
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
./launch.bat  # Starts Redis (Docker), API, Workers, and UI
```

## Architecture

This is a monorepo for the **Damba framework** — an Express-based, schema-driven backend framework with AI-assisted code generation. The philosophy is: **Schemas/Models → Services → Routes → Docs**.

### Packages

| Directory | Purpose |
|-----------|---------|
| `api/` | Main Express backend. Registers all services, configures middleware, starts the server. |
| `workers/` | BullMQ job workers — entity CRUD, AI agent execution, project provisioning. |
| `common/Damba/v2/` | The Damba framework core. Service registry, route generation, DAO abstraction, auth, Redis, NATS, Socket.io. |
| `common/Damba/v1/` | Legacy framework internals (still used for auth). |
| `packages/database/` | TypeORM entities and DataSource initialization. All DB entities live here. |
| `packages/validators/` | Zod validation schemas shared across packages. |
| `ui/damba/` | React 19 + Vite + Tailwind CSS frontend. |
| `DambaCli/` | CLI scaffolding tool that creates service directory structures. |
| `AppTest/` | Integration tests. |

### How the API server is composed

`api/src/index.ts` calls `Damba.start()` (from `common/Damba/v2/`) with an `AppConfig` object. That config references an `_SPS_INDEX_` array — a Service Provider Index — which lists every service module.

Each service module exports a Damba service created via `createService(path, Entity?)`. The framework auto-generates CRUD routes from the TypeORM entity and mounts any manually declared routes. Routes can attach **behaviors** (pre/post processors) and **extras** (runtime metadata injected on `req.extras`).

### Middleware injected on every request

`api/src/config/app.config.ts` sets up the request context injector, which attaches to `req`:
- `openai` — OpenAI client
- `redis` — Redis client
- `db` — TypeORM repository
- `mail` — Nodemailer service
- `tavily` — Tavily search client
- Tenant header and correlation ID for queue context propagation

### Workers

Workers in `workers/src/workers/` are BullMQ processors. They receive jobs from the same Redis instance. Each worker file registers one or more queue processors. Context (tenant, correlation ID) is passed via job data headers.

### AI integration

AI agents are managed through `api/src/AgentModule/`. The stack uses LangChain orchestrating OpenAI GPT-4o-mini (cloud) and Ollama/Qwen (local models), with Tavily for web search.

### Database

TypeORM DataSource is initialized in `packages/database/src/DataSource.ts` with retry logic (8 retries, 1s delay). All entities are in `packages/database/src/entities/`. The `DambaRepository` in `common/Damba/v2/dao/` wraps TypeORM repositories.

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
