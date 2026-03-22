# Damba AI Agent Marketplace — Backend Services (README)

This backend implements an **AI Agent Marketplace** for Damba where:
- Publishers create **AgentDefinitions** (the actual agent “product”).
- Publishers create/manage **AgentListings** (storefront metadata: price, tags, visibility).
- Organizations **install/purchase** agents (creates **Licenses**).
- Organizations **assign** agents to a scope (Project / App / Module / Service) via **Assignments**.
- Organizations **run** assigned agents, producing **Runs** and optionally **Proposals** (AST patches).
- Organizations **accept/reject** proposals.

> **Important Damba runtime rules used here**
- **Current user** is read from: `e.in.payload`
- **Saving to DB**
  - `api?.DSave(entityInstance)` can only save the service’s attached entity (`service.entity`)
  - Any other entity read/write from anywhere uses:
    - `const repo = api?.DRepository()`
    - `repo.DGet1(...)`, `repo.DGetAll(...)`, `repo.DSave(Entity, data)`, etc.
- **Extras**
  - Extras are attached on behaviors via: `extras: marketplaceExtras`
  - Cross-service extras calls use: `e.in.extras.marketplace_extras.{extraName}()`

---

## Services Overview

### 1) `MarketplaceExtrasService` (`/marketplace_extras`)
**Purpose:** Shared helper functions (“extras”) reusable across all marketplace services.

**Why it exists:**  
A single place for cross-cutting DB operations and validation rules, without duplicating logic in every behavior.

**What it provides (examples):**
- `loadApprovedAgent(agentDefinitionId)`
- `loadListing(agentDefinitionId)`
- `requireActiveLicense(orgId, agentDefinitionId)`
- `getOrCreateActiveLicense(orgId, agentDefinitionId, purchaseId)`
- `validateConfig(inputsSchema, config)`
- `createPaidPurchase(...)` (MVP: manual paid)

**How to call it:**
- From another service:
  - `e.in.extras.marketplace_extras.loadApprovedAgent(id)`
- The service includes a minimal `/ping` endpoint to ensure it registers and exposes extras.

---

### 2) `AgentDefinitionService` (`/agent_definitions`)
**Purpose:** Manages the **AgentDefinition** lifecycle (publisher + admin moderation).

**AgentDefinition = the source-of-truth “product”**
It includes things like:
- name, description
- role type (Developer/PM/QA/etc), emoji, color
- `inputsSchema` (JSON schema for config validation)
- `artifactRef` (reference to code/agent package)
- scopes/capabilities/permissions requested
- status + version metadata

**Key behaviors:**
- `POST /create`  
  Create an agent definition in `Draft`.
- `PUT /:agentDefinitionId`  
  Update agent definition (only `Draft` or `Rejected`).
- `POST /:agentDefinitionId/submit`  
  Submit for review (`Submitted`).
- `POST /:agentDefinitionId/approve` *(admin)*  
  Approve (`Approved`). Can optionally create a default listing.
- `POST /:agentDefinitionId/reject` *(admin)*  
  Reject (`Rejected`).
- `POST /:agentDefinitionId/delist`  
  Delist an agent (`Delisted`).
- `GET /:agentDefinitionId`  
  Fetch a definition.

**User context used:**
- Publisher identity from `e.in.payload` (ex: `id`, `orgId`)
- Admin check via `e.in.payload.isAdmin` (placeholder—use your real field)

---

### 3) `AgentListingService` (`/agent_listings`)
**Purpose:** Manages marketplace **listings** (storefront metadata).

**AgentListing = “storefront record”**
Includes:
- price type (free/one-time)
- price amount/currency
- tags
- visibility (public/unlisted)
- publishedAt

**Key behaviors:**
- `POST /create`  
  Create a listing for an approved AgentDefinition.
- `PUT /:listingId`  
  Update listing metadata (price, tags, etc).
- `POST /:listingId/publish`  
  Make listing public.
- `POST /:listingId/unpublish`  
  Remove from public view (unlisted).
- `DELETE /:listingId`  
  Delete listing.

> Listings do NOT define the agent behavior or logic; they only control the marketplace presentation and purchase rules.

---

### 4) `AgentCatalogService` (`/agent_catalog`)
**Purpose:** Read-only public browsing (“marketplace search”).

**What it does:**
- Serves marketplace search + browse endpoints that return:
  - listing + definition combined

**Key behaviors:**
- `GET /marketplace/agents`  
  Browse and filter listings:
  - query filters: `q`, `roleType`, `priceType`, `tag`
- `GET /marketplace/agents/:agentDefinitionId`  
  Fetch one agent definition + listing.

**Note:**  
The MVP uses simple query + filtering. Later you can optimize with `repo.QueryBuilder(...)`.

---

### 5) `AgentLicenseService` (`/agent_licenses`)
**Purpose:** Installs/purchases agents into an organization’s library by issuing **licenses**.

**License = org’s right to use an agent**
It is what enables assignment and runs.

**Key behaviors:**
- `POST /orgs/:orgId/install`  
  Installs a **free** agent (idempotent).
- `POST /orgs/:orgId/purchase`  
  Purchases an agent (MVP: manual purchase) then issues license.
- `GET /orgs/:orgId/library`  
  List org’s active licenses.

**Important internal dependency:**
- Uses `MarketplaceExtrasService` for:
  - approved agent verification
  - listing lookup
  - license creation
  - purchase creation

---

### 6) `AgentAssignmentService` (`/agent_assignments`)
**Purpose:** Assigns an agent (licensed) to a target scope in an org.

**AgentAssignment = configuration + target scope**
Examples of scopes:
- Project
- Application
- Module
- Service

Assignments store:
- enabled flag
- triggers (manual/webhook/scheduled — depending on your enum)
- `config` object validated against agent’s `inputsSchema`

**Key behaviors:**
- `POST /orgs/:orgId/create`  
  Create assignment:
  - requires active license
  - validates config vs schema
- `GET /orgs/:orgId/list`  
  List assignments (optional filters by scope)
- `PUT /orgs/:orgId/:assignmentId`  
  Update assignment (config re-validated)

**User context used:**
- creator userId saved from `e.in.payload.id`

---

### 7) `AgentRunService` (`/agent_runs`)
**Purpose:** Executes an assigned agent and records the execution.

**AgentRun = execution record**
Stores:
- input snapshot (scope + config + AST)
- start/end timestamps
- status (running/succeeded/failed)
- output summary/error

**Key behaviors:**
- `POST /orgs/:orgId/run`  
  Runs an agent by `assignmentId`:
  1) loads assignment
  2) checks license active
  3) creates run = `Running`
  4) calls the agent runner (stub in MVP)
  5) updates run status + output
  6) optionally creates a proposal if runner returns a patch

**Important Damba rule handled here:**
- Since `service.entity = AgentRun`, saving `AgentProposal` is done using:
  - `repo.DSave(AgentProposal, proposal)` (NOT `api.DSave`)

---

### 8) `AgentProposalService` (`/agent_proposals`)
**Purpose:** Accepts or rejects proposals produced by agent runs.

**AgentProposal = suggested change**
Typically:
- AST patch operations to apply to Damba architecture JSON

**Key behaviors:**
- `POST /orgs/:orgId/:proposalId/decide`
  - `{ decision: "accept" | "reject" }`
  - on accept:
    - calls `applyAstPatchToArchitecture(...)` (stub hook)
    - marks proposal accepted
  - on reject:
    - marks proposal rejected

**Integration point:**
- Replace the stub `applyAstPatchToArchitecture` with your real:
  - Architecture versioning module behavior
  - AST patch apply engine

---

## High-level Flow

1) Publisher creates AgentDefinition (draft)
2) Publisher submits → Admin approves
3) Listing is created and published (optional on approval)
4) Buyer org installs/purchases → License becomes active
5) Buyer org creates Assignment (scope + config validated)
6) Buyer runs agent → Run recorded
7) If agent proposes changes → Proposal created
8) Buyer accepts proposal → AST patch applied to project architecture

---

## Notes / Next Enhancements

- Add **Policies**:
  - AuthGuard, PublisherOnly, AdminOnly, OrgMember
- Add **AuditEventService** to record actions (install, purchase, run, accept)
- Replace manual purchases with Stripe/PayPal
- Optimize marketplace search using `QueryBuilder` joins
- Add agent versioning: “clone definition into vNext”, deprecate old versions