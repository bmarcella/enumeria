# DambaRepository

Generic TypeORM data-access layer used across the Damba framework.
Import path: `@Damba/v2/dao`

## Initialization

`DambaRepository` is a singleton. Initialize it once at startup with your TypeORM `DataSource`, then reuse the same instance everywhere.

```ts
import { DambaRepository } from '@Damba/v2/dao';
import { DataSource } from 'typeorm';

const dao = DambaRepository.init(dataSource);
```

---

## Method reference

### Setup

#### `getRepository<E>(T)`
Returns the raw TypeORM `Repository<E>` for an entity. Use when you need full TypeORM API access beyond what `DambaRepository` exposes.

```ts
const repo = dao.getRepository(User);
```

#### `QueryBuilder(T, name?)`
Returns a TypeORM `SelectQueryBuilder` for an entity, optionally aliased.

```ts
const qb = dao.QueryBuilder(User, 'u');
```

#### `getRelation(T, relation)`
Returns the TypeORM relation metadata for a given property name.

```ts
const rel = dao.getRelation(Application, 'modules');
```

---

### Save

#### `DSave(T, data, tree?)`
Save a single entity. Inserts if no ID, updates if ID exists.

```ts
const user = await dao.DSave(User, { name: 'Alice', email: 'alice@example.com' });
```

#### `DSaveMany<E>(T, data[])`
Bulk-save an array of entities in a single call.

```ts
const modules = await dao.DSaveMany(Modules, [
  { name: 'AuthModule', projId },
  { name: 'UserModule', projId },
]);
```

#### `DUpsert(T, data, conflictPaths)`
Insert or update based on conflict columns. Useful for sync operations.

```ts
// Insert or update where email is the unique key
await dao.DUpsert(User, { email: 'alice@example.com', name: 'Alice' }, ['email']);

// Bulk upsert
await dao.DUpsert(Modules, [{ id: '...', name: 'AuthModule' }], ['id']);
```

---

### Fetch

#### `DGet1<E>(T, predicates?, tree?)`
Find a **single** entity. Returns `null` if not found.

```ts
const user = await dao.DGet1(User, { where: { id: userId } });
```

#### `DGetAll<E>(T, predicates?, tree?)`
Find **all** entities matching the predicate. Returns empty array if none found.

```ts
const modules = await dao.DGetAll(Modules, { where: { projId } });
```

#### `DGetWithRelations<E>(T, where, relations[], all?)`
Find one or many entities with eagerly-loaded relations.

```ts
// One with relations
const app = await dao.DGetWithRelations(Application, { id: appId }, ['modules', 'middlewares']);

// All with relations
const apps = await dao.DGetWithRelations(Application, { projId }, ['modules'], true) as Application[];
```

#### `DFindByIds<E>(T, ids[])`
Find multiple entities by their primary key values.

```ts
const users = await dao.DFindByIds(User, ['id-1', 'id-2', 'id-3']);
```

#### `DExists(T, where)`
Returns `true` if at least one row matches. Use instead of fetching and checking length.

```ts
const exists = await dao.DExists(User, { email: 'alice@example.com' });
if (exists) throw new Error('Email already taken');
```

#### `DGetPage<E>(T, options)`
Paginated fetch. Returns items + pagination metadata in one query.

```ts
const result = await dao.DGetPage(User, {
  where:     { orgId },
  relations: ['role'],
  order:     { createdAt: 'DESC' },
  page:      2,
  limit:     10,
});

// result: { items: User[], total: 45, page: 2, totalPages: 5 }
```

---

### Update

#### `DUpdate(T, where, data)`
Update rows matching `where` with partial `data`.

```ts
await dao.DUpdate(User, { id: userId }, { name: 'Bob' });
```

---

### Delete

#### `DDelete(T, preds?, tree?)`
Hard-delete rows matching the predicate.

```ts
await dao.DDelete(Session, { userId });
```

#### `DSoftDelete(T, where)`
Soft-delete rows — sets `deletedAt` timestamp instead of removing the row.
Entity must have a `@DeleteDateColumn` column.

```ts
await dao.DSoftDelete(Project, { id: projectId });
```

#### `DRestore(T, where)`
Restore soft-deleted rows — clears `deletedAt`.

```ts
await dao.DRestore(Project, { id: projectId });
```

---

### Count

#### `DCount(T, preds?)`
Count rows matching the predicate.

```ts
const total = await dao.DCount(User, { where: { orgId } });
```

---

### Raw SQL

#### `DQuery<R>(sql, params?)`
Execute a raw parameterised SQL query. Uses `$1, $2, ...` placeholders (PostgreSQL).

```ts
const rows = await dao.DQuery<{ name: string; count: string }>(
  `SELECT name, COUNT(*) as count FROM modules WHERE proj_id = $1 GROUP BY name`,
  [projectId],
);
```

---

### QueryBuilder methods

Use these when the `D*` helpers are not expressive enough (joins, subqueries, complex conditions).

#### `QBGetAll(T, name?, select?, where?)`
Select raw columns with an optional where clause. Returns raw rows.

```ts
const rows = await dao.QBGetAll(
  User,
  'u',
  ['u.id', 'u.name'],
  { value: 'u.orgId = :orgId', data: { orgId } },
);
```

#### `QBGetOne<E>(T, name?, build?)`
Run a fully custom QueryBuilder and return a single mapped entity.

```ts
const user = await dao.QBGetOne<User>(User, 'u', (qb) =>
  qb
    .leftJoinAndSelect('u.role', 'r')
    .where('u.email = :email', { email })
    .andWhere('u.active = true'),
);
```

#### `QBUpdate(T, set, where?)`
Update via QueryBuilder.

```ts
await dao.QBUpdate(
  User,
  { lastLogin: new Date() },
  { value: 'id = :id', data: { id: userId } },
);
```

#### `QBCount(T, name?, where?)`
Count rows via QueryBuilder.

```ts
const count = await dao.QBCount(
  Behavior,
  'b',
  { value: 'b.servId = :servId', data: { servId } },
);
```

#### `QBGetPage<E>(T, name?, options)`
Paginated QueryBuilder query. Returns mapped entities + pagination metadata.

```ts
const result = await dao.QBGetPage<User>(User, 'u', {
  where: { value: 'u.orgId = :orgId', data: { orgId } },
  order: { column: 'u.createdAt', direction: 'DESC' },
  page:  1,
  limit: 20,
});

// result: { items: User[], total: 120, page: 1, totalPages: 6 }
```

---

## Method cheat sheet

| Method | Returns | Use when |
|---|---|---|
| `DSave` | `T` | Save or update one entity |
| `DSaveMany` | `T[]` | Bulk insert/update |
| `DUpsert` | `InsertResult` | Insert or update by unique key |
| `DGet1` | `T \| null` | Fetch one entity |
| `DGetAll` | `T[]` | Fetch many entities |
| `DGetWithRelations` | `T \| T[]` | Fetch with joined relations |
| `DFindByIds` | `T[]` | Fetch by primary key list |
| `DExists` | `boolean` | Check existence without fetching |
| `DGetPage` | `{ items, total, page, totalPages }` | Paginated list |
| `DUpdate` | `UpdateResult` | Partial update by condition |
| `DDelete` | `DeleteResult` | Hard delete |
| `DSoftDelete` | `UpdateResult` | Soft delete (sets `deletedAt`) |
| `DRestore` | `UpdateResult` | Restore soft-deleted row |
| `DCount` | `number` | Count matching rows |
| `DQuery` | `R[]` | Raw SQL query |
| `QBGetAll` | `any[]` | Raw select with QB |
| `QBGetOne` | `T \| null` | Complex QB → single result |
| `QBUpdate` | `UpdateResult` | Complex QB update |
| `QBCount` | `number` | Complex QB count |
| `QBGetPage` | `{ items, total, page, totalPages }` | Complex QB pagination |
