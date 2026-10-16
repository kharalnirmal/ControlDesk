# Feature Implementation Recipes — What to Build, Why, and How to Verify

**Purpose:** Turn GitHub backlog titles into a reliable independent development sequence. **These are implementation recipes, not a claim that all code is already written.** Read `00_SOURCE_OF_TRUTH.md` for scope, `02_BUILD_GUIDE.md` for setup, `15_BACKEND_MASTERCLASS.md` for mental models, and `11_TESTING_HANDS_ON_LAB.md` for validation. Commit each vertical slice through an Issue and PR.

## Definition of a vertical slice

A vertical slice includes visible UI + server-side boundary + validation/authorization + persistence + user feedback + tests. Build one small slice end-to-end before beginning the next. A static table is *not* complete Product Management. A Prisma model is *not* complete Inventory.

## M0 — Project foundations (planning, 4 issues)

1. **Requirements:** Read `00_SOURCE_OF_TRUTH.md`. Confirm ControlDesk is a **single-business catalog/inventory admin** for v0.1, not a customer-facing store. Mark all future features explicitly planned. Acceptance: scope & non-goals stated, initial actors defined.
2. **Repository:** create Next app and a private GitHub repo using `10_GITHUB_HANDS_ON_LAB.md`. Acceptance: `npm run dev` renders, correct origin remote, clean git status.
3. **Workflow:** create `M0` milestone, Issue, Project board, first docs branch and PR; practice CI once scripts are configured. Acceptance: visible merged PR and closed Issue with evidence.
4. **Decision log:** keep one-page ADR for single-app architecture, npm choice, DB/hosting/UI. Acceptance: docs say *why* and what would trigger revision.

## M1 — Real UI shell (5 issues)

1. Install shadcn foundation on `feat/ui-shell` **after** saving functioning server routes. Run Next app; inspect produced files.
2. Compose dashboard with sidebar, app header, user menu and desktop/mobile layouts. Wire real route Links (`/dashboard`, `/dashboard/products`, `/dashboard/categories`, `/dashboard/settings` if implemented). Never leave dummy menu links.
3. Add theme switch with a consistent global token palette. Test light/dark and reload persistence where applicable.
4. Add shared components: input, select, dialog, toast, table, card, skeleton, empty state, accessible confirmation. Select only free licensed sources.
5. Capture mobile 375px, desktop light and desktop dark screenshots; keyboard and reduced-motion review. Acceptance: `12_UI_IMPLEMENTATION_SPEC.md` checklist passed.

**Note:** `dashboard-01` is demo UI. Replacing its demo cards/charts/table with real Prisma-backed data is a separate implementation issue, not a quick reskin.

## M2 — Database and authentication (6 issues)

1. **Environment:** Neon **development** DB created; `DATABASE_URL` only in `.env`; `.env.example` placeholders committed; Prisma driver adapter and config installed. Acceptance: `npx prisma validate` and `npx prisma generate` run.
2. **Schema:** model Category and Product. Choose unique SKU, category FK, nullable description/image, decimal price, integer stock, `archivedAt`; model `AdminAccess` as a v0.1 admin grant. Discuss relation/cardinality first. Acceptance: diagram in `templates/DB_ERD.md` reflects actual schema.
3. **Migrations:** `npx prisma migrate dev --name catalog-baseline` on dev only; commit migration SQL; inspect any manually added DB `CHECK` constraint and test it.
4. **Authentication:** configure Better Auth email/password, Prisma adapter and generated auth models. CLI `npx auth@latest generate` **does not run migration**; inspect schema then `npx prisma migrate dev --name add-auth`, `npx prisma generate`. Test signup in development and sign-in/out.
5. **Authorization:** `requireAdmin()` obtains session and separately validates AdminAccess on DB; place it on protected route layout *and separately in each mutation*. In production, disable public signup at auth endpoint; provision legitimate admins through an approved bootstrap/onboarding procedure, not anonymous registration.
6. **Tests:** anonymous/non-admin denied; admin allowed; missing env produces explicit failure; schema matches database. Acceptance: authorization tests and at least manual direct-action boundary checks. Avoid depending only on UI hidden buttons.

**Known design risk:** `AdminAccess.userId` in starter is a plain unique string, not an actual FK to Better Auth User. The database cannot enforce referential integrity for this link. Accept only for guided bootstrap, or design an explicit relation carefully after reviewing generated User schema; log it before production.

## M3 — Catalog features (5 issues, build in this order)

### 3A. Category create/list (guided starter partly implements)

- **Input:** `name`. Normalize and validate on the server; define whether duplicate names are case-sensitive. Starter lowercases category names.
- **Boundary:** verify admin for write. Never trust button visibility.
- **Persistence:** Prisma `category.create`; uniqueness DB constraint catches races. Handle `P2002` as a friendly conflict.
- **UI:** category form and table/list, loading/empty/error state, count of related products.
- **Tests:** blank/long name rejected; duplicate normalized names conflict; non-admin denied. Acceptance: a valid category survives browser refresh.

### 3B. Product create (guided starter partly implements)

- **Input contract:** SKU 3–32 allowed chars and unique, name 2–120, price decimal string `>=0` within DB precision, stock integer `0..1,000,000`, category exists, optional description and HTTPS image URL.
- **Sequence:** submit form → server action → admin check → Zod parse → create with Prisma → map unique/FK errors → invalidate affected pages → show success/error and refresh list/counts.
- **Tests:** invalid SKU, decimals 3+ places, negative/non-integer stock, category removed just before submit, concurrent duplicate SKU, non-admin direct invocation.
- **Acceptance:** invalid input never persists; duplicate does not overwrite original; success visible after refresh; no credentials/leaks in browser.

### 3C. Product listing

- URL query params: `?q=mouse&page=1&categoryId=...&sort=newest&status=active` (implementation contract to define precisely).
- Parse and bound page, page size, sort key and query length on server; reject/ignore unknown sort keys rather than interpolate into raw SQL.
- In Prisma, use matching `where` for `findMany` and `count`; use stable sort with secondary `id`, `skip` and `take`. Consider adding indexes after measuring slow queries.
- Tests: empty query, no matches, malicious/huge page, last page, stable ordering with same timestamp, category filtering, no leaks of archived products. Ensure query filter stays on navigation.
- Acceptance: genuine server pagination/filtering; no UI-only demo filtering over first ten records.

### 3D. Product edit and archive/restore

- **Not implemented in starter.** Create update schema; validate edit permissions, id, allowed changes. Use `findUnique` or guarded `updateMany` for missing/archived records. Define whether SKU can change.
- Archive with `archivedAt=now` rather than hard-delete so history can be preserved. Restore resets `archivedAt=null`; index/list recalculates. Require confirmation for destructive effects.
- Tests: nonexistent id, invalid edits, duplicate SKU, repeat archive, repeated restore, unauth actor, race on same record.
- Acceptance: detail reflects changes, list/metrics consistent, errors are friendly.

### 3E. Category rename/delete restrictions

- **Not implemented in starter.** Decide behavior for categories with products. Suggested v0.1: restrict deleting categories with linked products; use DB FK `onDelete: Restrict` as final safety. Test a category with 0 and >0 products.

## M4 — Analytics, verification and release (6 issues)

1. Build server-side KPI queries for active product count, category count, low stock (`1..5`), out-of-stock (`0`), total stock units; render as shadcn cards. Ignore archived items where required.
2. Aggregate category product counts and show a Recharts/shadcn bar. Demonstrate query→transform→chart data flow. **Do not ship mock revenue** until real order/payment rules exist.
3. Run Vitest schema tests; set up Playwright sign-in smoke; add auth and catalog E2E on isolated DB where possible. Test mobile/manual matrix.
4. Integrate GitHub Actions: `npm ci → prisma generate → lint → typecheck → unit tests → build`. Fix errors before merging to main. Configure job permissions conservatively.
5. Connect GitHub repo to Vercel. Set env vars per environment; use a separate Neon database for preview/staging. Apply reviewed migrations through a trusted channel. Never test admin write flows against real customer data.
6. Release only after the checklist is complete. Write notes distinguishing implemented vs planned, tag `v0.1.0`, take screenshots, record known limitations and next milestones.

## M5 — Orders and inventory transactions (planned v0.2)

1. **Domain model first:** define `Order`, `OrderItem`, `Customer` (if required), status enum, immutable order line price snapshot, timestamps, uniqueness/order reference. Do not treat Orders as one JSON blob.
2. **State diagram:** define allowed transitions, e.g. `DRAFT → CONFIRMED → SHIPPED → DELIVERED` and allowed cancellation states. Reject invalid transitions; write pure unit tests of transition map first.
3. **Inventory consistency:** `stock >= 0` must hold even when two users confirm simultaneously. In a DB transaction, atomically decrement with a conditional update (`stock >= requested`) and verify affected row count; if any product lacks stock, roll back whole operation.
4. **Idempotency:** retries of order confirmation should not charge/ship/deduct twice. In this app, no real payments in scope. Use status checks and/or idempotency key with uniqueness as appropriate.
5. **Error model:** distinguish invalid transition, insufficient stock, missing product and internal DB failure without leaking SQL.
6. **Tests:** two simultaneous confirmations of last unit → only one succeeds; failure on one line item rolls back all stock changes; cancel reverses once only according to documented rules.
7. **UI:** order list/detail, status badge, searchable records, explicit confirmation modal, transaction audit trail.

**Note:** No runnable order API is shipped in the starter; you must implement and verify these steps.

## M6 — Staff permissions and audit log (planned v0.2)

1. Draft permission matrix for Admin/Staff operations (read catalog, create/edit/archive, manage staff, view audit). Decide if Owner role is actually needed.
2. Enforce rules in server-side services/actions, including object-level checks when multiple organizations arrive; no security in hidden links alone.
3. Consider role revocation and old sessions; prove revoked access stops working without waiting for a new login.
4. Add append-only-ish `AuditEvent` records to DB and record meaningful actor, entity type/id, action, timestamp, request correlation metadata and non-sensitive changed fields. Never log raw passwords or tokens.
5. Test role × action × resource matrix, tampered ids, missing resources, no-audit-write failure handling. Explain tradeoffs if audit write and business mutation must be transactional.

## M7 — Production engineering (planned v1.0)

1. **Observability:** structured logs, request correlation IDs, errors alerting, latency and failure rate. Know what not to log (PII/secrets).
2. **CI hardening:** separate isolated DB for migrations/integration, Playwright Chromium install and seeded E2E account. E2E must be hermetic and should clean up its own data.
3. **Security:** threat model, auth boundary, CSRF/session risks, input validation, rate limiting, secret rotation and dependency updates. Do not rely on client code for enforcement.
4. **Performance:** measure slow queries, EXPLAIN, indexes, avoid N+1 and unbounded `findMany`, inspect bundle costs and GSAP motion overhead.
5. **Operations:** backup schedule, tested restore, migration expand/contract plan, code rollback, incident runbook, monitoring, release notes and documented owner of resources.
6. **Accessibility:** keyboard and screen-reader checks, contrast, reduced motion, meaningful labels and error focus.
7. **Completion:** release evidence, green gated tests, documented known limitations and independently reproducible setup.

## Design API contracts before handlers

A Next.js Server Action can be the endpoint for admin UI mutations; Route Handlers are useful for explicit HTTP clients/webhooks/integrations. Both are security-sensitive server entry points. Before adding any one, write:

```text
Operation: CreateProduct
Actor: Admin
Input: {sku, name, price, stock, categoryId, description?, imageUrl?}
Preconditions: session active; admin grant exists; category exists
Invariants: SKU unique; stock nonnegative integer; price precise
Transaction: one DB insert; uniqueness and FK enforced by DB
Success: product id; safe UI success; refresh product list and KPIs
Failure: invalid input, unauthenticated, unauthorized, SKU conflict, bad category, DB outage
Idempotency: duplicate submission? currently second insert should reject; implement button pending UX
Test cases: valid; validation; permission; unique; FK; failure/retry
Telemetry: log failures without secrets
```

Do the same for `ArchiveProduct`, `ConfirmOrder`, `InviteStaff` and other operations. This contract-first habit is transferable to Express, Go, Java or Python later.
