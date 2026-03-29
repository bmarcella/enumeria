# Damba (v2) — Schema-Driven Backend Framework with AI Code Generation

Damba is an Express-based, schema-driven backend framework designed for **AI-assisted code generation**. It standardizes how you declare services, auto-generates CRUD from TypeORM entities, supports real-time via Socket.io, background jobs via BullMQ, and produces API documentation — all with strong conventions that make codegen easy and consistent.

> **Schemas/Models -> Services -> Routes -> Docs**

---

## Request Flow

```
Client Request
    |
    v
Express App (Damba.start())
    |
    +-- CORS, Body Parser, Session
    +-- Queue Context (tenant + correlationId)
    |
    v
Module Middleware (IModule.middleware[])
    |  Runs for ALL services in this module
    |
    v
Service Middleware (createDambaService.middlewares[])
    |  Runs for ALL routes in this service
    |  Wrapped in DambaContext (AsyncLocalStorage)
    |
    v
Route Middleware (per-route)
    |  +-- Timeout middleware
    |  +-- Zod validators (body, params, query)
    |  +-- Custom DEvent middleware
    |
    v
Handler (DEventHandler / Behavior)
    |  Access via DEvent: { in: req, out: res, go: next }
    |  Access via DambaContext: req(), res(), getState()
    |  Access via api: DSave(), DFindOne(), DRepository(), enqueue()
    |
    v
Response (or Error -> ErrorHandler)
```

---

## Building a Service

### 1. Define the service

```ts
const service: DambaService = {
  name: '/todos',
  entity: Todo,           // TypeORM entity -> auto-generates CRUD
  config: {
    crud_path: '/damba',
    id_name: 'id',
    crud: { create: true, read: true, update: true, delete: false },
  },
};
```

### 2. Define handler functions

```ts
export const getAllTodos = (api?: DambaApi): DEventHandler => {
  return async (e: DEvent) => {
    const todos = await api?.DFindAll({});
    e.out.send(todos);
  };
};

export const createTodo = (api?: DambaApi): DEventHandler => {
  return async (e: DEvent) => {
    const todo = await api?.DSave(e.in.body);
    e.out.status(201).send(todo);
  };
};
```

### 3. Define BehaviorHooks

A BehaviorHook maps a path to a method, handler, and optional config:

```ts
const BehaviorHook_1 = {
  '/': {
    method: Http.GET,
    behavior: getAllTodos,
  },
};

const BehaviorHook_2 = {
  '/': {
    method: Http.POST,
    behavior: createTodo,
    config: {
      validators: {
        body: z.object({
          title: z.string(),
          description: z.string().optional(),
        }),
      },
    },
  },
};
```

Multiple hooks on the same path use an array:

```ts
const BehaviorHook_3 = {
  '/:id': [
    {
      method: Http.GET,
      behavior: getTodoById,
      config: { validators: { params: z.object({ id: z.string() }) } },
    },
    {
      method: Http.PUT,
      behavior: updateTodo,
      config: { validators: { params: z.object({ id: z.string() }), body: UpdateTodoSchema } },
    },
  ],
};
```

### 4. Compose into BehaviorsChainLooper

```ts
const behaviors: BehaviorsChainLooper = {
  ...BehaviorHook_1,
  ...BehaviorHook_2,
  ...BehaviorHook_3,
};
```

### 5. Export the service

```ts
export default createDambaService({ service, behaviors });
```

---

## Modules

Modules group services and apply shared middleware:

```ts
export const TodoModule: IModule<Request, Response, NextFunction> = {
  name: 'todos',
  services: { ...TodoService, ...TagService },
  middleware: [authorize(pubKey, jwt, ['user'])],
};
```

The app composes modules:

```ts
await Damba.start({
  modules: [CoreModule, TodoModule, AgentModule],
  AppConfig,
  express,
});
```

Module middleware runs before all service/route middleware for every service in that module.

### How Services work internally

A service is created with `createDambaService()`. It returns an `IServiceProvider` — an object keyed by the service mount path:

```ts
// createDambaService({ service, behaviors }) returns:
{
  '/todos': {
    service: { 'GET@/': {...}, 'POST@/': {...}, 'GET@/:id': {...} },
    middleware: [...],
    dbEntity: Todo,
    events: {...},
  }
}
```

Each key in `service` is a route key in the format `METHOD@/path`. The framework parses these and mounts them on an Express sub-router.

### The spread pattern

Services export `IServiceProvider` objects. Modules spread them together:

```ts
// TodoService exports:   { '/todos': { service: {...}, ... } }
// TagService exports:    { '/tags': { service: {...}, ... } }

// Module spreads them into one object:
const TodoModule: IModule = {
  name: 'todos',
  services: { ...TodoService, ...TagService },
  //         { '/todos': {...}, '/tags': {...} }
};
```

### How DambaRoute mounts them

When the app starts, `DambaRoute` iterates modules and services:

```
for each module:
  moduleMws = module.middleware       // applied to ALL services in this module

  for each service in module.services:
    serviceMws = service.middleware    // applied to all routes in this service

    for each route in service:
      routeMws = route.middleware      // applied to this route only

      express.router[method](path, ...moduleMws, ...serviceMws, ...routeMws, ...handlers)
```

A request to `GET /api/todos/` goes through:

```
TodoModule.middleware  ->  TodoService.middleware  ->  route middleware  ->  handler
  (authorize)               (if any)                  (zod validators)    (DEventHandler)
```

### Grouping example

```ts
import TodoService from './Todo';
import TagService from './Tags';
import AuthService from './Auth';
import UserService from './User';

// No shared middleware on core routes
export const CoreModule: IModule = {
  name: 'core',
  services: { ...AuthService, ...UserService },
  middleware: [],
};

// All todo routes require authentication
export const TodoModule: IModule = {
  name: 'todos',
  services: { ...TodoService, ...TagService },
  middleware: [authorize(pubKey, jwt, ['user'])],
};

// Compose at app level
await Damba.start({
  modules: [CoreModule, TodoModule],
  AppConfig, express,
});
```

### Key concepts

- **Module** = organizational boundary + shared middleware. Does NOT affect the route path.
- **Service** = route boundary + entity binding + CRUD generation. Controls its own mount path via `name`.
- **BehaviorHook** = individual route definition (path + method + handler + validators).
- **Behavior** = collection of BehaviorHooks spread into `BehaviorsChainLooper`.

---

## Auto-Generated CRUD

When `entity` is provided, Damba auto-generates:

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/todos/damba` | Fetch all |
| GET | `/todos/damba/:id` | Fetch one |
| GET | `/todos/damba/:id/:relation` | Fetch relation (1:N, M:N) |
| POST | `/todos/damba` | Create |
| PATCH | `/todos/damba/:id` | Partial update |
| PUT | `/todos/damba/:id` | Full replace |
| DELETE | `/todos/damba/:id` | Delete (if enabled) |

Each CRUD operation supports `before[]` and `after[]` hooks:

```ts
config: {
  crud: {
    post: {
      active: true,
      before: [
        async (e, prev) => ({ predicate: { ...prev, createdBy: e.in.payload.userId } }),
      ],
      after: [
        async (e, saved) => {
          await api.enqueue('notifications', { type: 'todo_created', id: saved.id });
          return saved;
        },
      ],
    },
  },
}
```

---

## Error Handling

```ts
import { NotFoundError, ForbiddenError } from '@Damba/v2/errors';

export const getTodo = (api?: DambaApi): DEventHandler => {
  return async (e: DEvent) => {
    const todo = await api?.DFindOneById();
    if (!todo) throw new NotFoundError('Todo not found');
    if (!todo.isPublic) throw new ForbiddenError('Access denied');
    e.out.send(todo);
  };
};
// -> { ok: false, code: "NOT_FOUND", message: "Todo not found" }
```

Available error classes:

| Class | Status |
|-------|--------|
| `BadRequestError` | 400 |
| `ValidationError` | 400 |
| `UnauthorizedError` | 401 |
| `ForbiddenError` | 403 |
| `NotFoundError` | 404 |
| `ConflictError` | 409 |
| `TooManyRequestsError` | 429 |
| `InternalError` | 500 |

---

## Policies

```ts
import { Policy, allPolicies, anyPolicy } from '@Damba/v2/policies';

const mustOwnTodo: Policy = async (e: DEvent) => {
  const todo = await e.in.DRepository.DGet(Todo, { where: { id: e.in.params.id } });
  if (todo?.ownerId !== e.in.payload?.userId) {
    return { ok: false, status: 403, code: 'NOT_OWNER', message: 'Not your todo' };
  }
  return { ok: true };
};

// Use as middleware
const behaviors: BehaviorsChainLooper = {
  '/:id': {
    method: Http.DELETE,
    behavior: deleteTodo,
    middlewares: [allPolicies(mustOwnTodo, mustBeAdmin)],
  },
};
```

---

## Real-Time (Socket.io)

```ts
const events: EBChain = {
  'socket:create:todo': {
    message: (api?: DambaApi): EventHandler => {
      return async (socket, data, callback) => {
        const job = await api?.enqueue('create_todo', data.payload);
        return { jobId: job?.id };
      };
    },
    middleware: [auth?.socketCheck(['user'])],
  },
};

const queues: QueueBehavior = {
  'create_todo': {
    events: {
      completed: (api, ctx) => emitToRequest(ctx.requestId, 'complete:create:todo', ctx.returnvalue),
      progress: (api, ctx) => emitToRequest(ctx.requestId, 'progress:create:todo', ctx),
    },
  },
};

export default createDambaService({ service, behaviors, events, queues });
```

---

## DAO (Data Access)

```ts
const repo = e.in.DRepository;  // or api.DRepository()

// CRUD
await repo.DSave(Todo, { title: 'Buy milk' });
await repo.DGet(Todo, { where: { id } });
await repo.DGetAll(Todo, { where: { completed: false } });
await repo.DUpdate(Todo, { id }, { completed: true });
await repo.DDelete(Todo, { id });

// Pagination
await repo.DGetPage(Todo, { page: 1, limit: 20, where: { completed: false } });

// Relations
await repo.DGetWithRelations(Todo, { id }, ['tags', 'assignee']);

// QueryBuilder
const qb = repo.QueryBuilder(Todo, 'todo');
const results = await qb.where('todo.completed = :c', { c: false }).getMany();

// Soft delete
await repo.DSoftDelete(Todo, { id });
await repo.DRestore(Todo, { id });

// Raw SQL
await repo.DQuery<{ count: number }>('SELECT COUNT(*) as count FROM todos');
```

---

## AsyncLocalStorage Context

```ts
import { DambaContext } from '@Damba/v2/service/DambaContext';

const ctx = DambaContext.require();     // throws if outside request
const req = DambaContext.req();         // shorthand for context.event.in
const res = DambaContext.res();         // shorthand for context.event.out

// Per-request state
DambaContext.setState('currentUser', user);
const user = DambaContext.getState('currentUser');
```

---

## Package Structure

```
packages/
  database/         -> TypeORM entities (package-entities)
  validators/       -> Zod schemas (package-validators)
  policies/         -> Policies & middlewares (package-policies-middlewares)

api/
  src/
    services/       -> Damba services (createDambaService)
    AgentModule/    -> Agent-related services
    config/         -> AppConfig, SocketConfig
    index.ts        -> Damba.start()

workers/
  src/
    workers/        -> BullMQ processors
    projects/       -> Project creation pipeline (step-by-step)

common/
  Damba/v2/         -> Framework core
    service/        -> createDambaService, DambaContext, DEvent
    route/          -> DambaRoute (mounts services), DambaRouteDoc
    dao/            -> DambaRepository (TypeORM wrapper)
    auth/           -> JWT auth middleware
    errors/         -> DambaError hierarchy + error handler
    policies/       -> Policy composition (allPolicies, anyPolicy)
    IO/             -> Socket.io integration + SocketRegistry
    Ui/             -> Welcome page, API docs UI, Extras docs UI

ui/damba/           -> React 19 + Vite + Tailwind frontend
```

---

## Commands

```bash
# API
cd api && npm run dev       # Dev server with hot reload
cd api && npm run build     # TypeScript compile + Docker build

# Workers
cd workers && npm run workers   # Run all workers

# UI
cd ui/damba && npm run dev      # Vite dev server

# All services (Windows)
./launch.bat
```

---

## Environment

- `DEV` — Extra debug services, all CRUD ops enabled
- `QA` — Reset/seed services for test data
- `STAGING` — Mirrors PROD with some restrictions
- `PROD` — Restrict unnecessary operations

## Key Environment Variables

```
NODE_ENV, PORT
DATABASE_URL, REDIS_URL
OPENAI_API_KEY, TAVILY_API_KEY
JWT_PUBLIC_KEY, JWT_PRIVATE_KEY
SMTP_USER, SMTP_PASSWORD
SESSION_SECRET, CORS_ORIGINS
```
