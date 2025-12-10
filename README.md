# Damba (v1) — AI-first Service & Codegen Framework for Node.js

Damba is a lightweight, Express-compatible mini-framework designed for **schema/model-driven development** and **AI-assisted code generation**. It standardizes how you declare services, auto-generates CRUD endpoints from ORM entities, exposes a flexible `extras` metadata layer, and produces API documentation.

> TL;DR: **Schemas/Models → Services → Routes → Docs**, with strong conventions that make codegen easy and consistent.

---

## Why Damba?

### ✅ Built for code generation (AI-first)
Damba’s service DSL and internal route format are intentionally simple and serializable, making it ideal for automated generation.

### ✅ Express-compatible
Damba mounts routes on an Express router and plays nicely with standard Express middleware.

### ✅ Auto CRUD from entities
If you provide an ORM entity (currently TypeORM), Damba generates common CRUD endpoints automatically.

### ✅ Extras: metadata you can use at runtime
Routes can expose `extras` (helpers, mappers, metadata). Damba aggregates them and injects them on `req.extras`.

### ✅ Docs support
Damba can generate API documentation (`doc`) and exposes an endpoint for extras documentation.

---

## Core Concepts

### 1) Service = mounted module
A Damba service is mounted under a path like `"/projects"` or `"/auth"`.

```ts
const api = createService("/test", ProjectEntity);
