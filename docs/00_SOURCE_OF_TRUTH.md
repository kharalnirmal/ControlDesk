# ControlDesk — Product Requirements, Architecture & Project Handoff

**Status:** Approved planning baseline, **not** an implemented or deployed product  
**Version of this specification:** 1.0 · 14 October 2026  
**Intended audience:** developer, reviewer, collaborator, recruiter, future AI assistant  
**Source of truth:** this file supersedes informal assumptions made during chat. `docs/` contains implementation details; any change in scope requires updating this document.

## 1. Executive summary
ControlDesk is a **single-business e-commerce operations admin panel** built as a **single Next.js full-stack application**. It focuses on product/category management, stock visibility, protected operations, real database-backed analytics, and a polished responsive interface. The software is simultaneously a portfolio-quality deliverable and a structured engineering curriculum: learn the first principles behind backend design, secure data access, testing, frontend design, and professional GitHub/DevOps workflows by shipping small vertical slices.

ControlDesk is **not a customer-facing storefront**, a payment processor, or a generic placeholder analytics theme. V0.1 dashboard numbers must be computed from actual products/categories/inventory, not fictitious revenue. It is initially **single-company and admin-only**. Orders, staff access, detailed inventory movement and customer tracking are future modules. The product is intended to become production-worthy through explicit hardening; an MVP is *not* presumed production-safe merely because it deploys.

**Value proposition:** one place where a small merchant can create and maintain a product catalog, understand stock status, and review operational metrics. **Success:** an authenticated administrator can perform the full product/category workflow reliably, see accurate counts, and use the app across devices; automated tests and CI gate changes.

## 2. Project outcomes
1. **Product:** responsive, appealing operations dashboard with real data and usable empty/error/loading states.
2. **Backend fundamentals:** explain and implement request boundaries, authorization, validation, business rules, queries, transactions, errors, data modeling, indexing, and caching in context.
3. **Frontend fundamentals:** understand Server vs Client Components, rendering, form state, accessibility, responsive layout, GSAP restraint, component selection, and design consistency.
4. **Engineering workflow:** use issues, milestones, branches, focused commits, pull requests, review checklists, CI, deployment, release notes, and rollback thinking.
5. **Self-reliance:** complete feature exercises before consulting finished examples; document decisions; trace bugs systematically.

**Deliberate trade-off:** focus on one deployable Next.js application instead of a separate Express service. A Route Handler can expose an HTTP API if needed. Server Actions can handle browser form mutations. Internal server-side modules remain organized into validation, use cases/services and data access.

## 3. Decisions locked in
| Decision | Baseline | Reason |
|---|---|---|
| Application | Next.js App Router + React + TypeScript | Single full-stack learning surface; reduces distributed app overhead |
| Style | Tailwind CSS, shadcn/ui base | Editable accessible building blocks |
| Visual approach | Hybrid SaaS; professional first, tasteful animations second | UI polish without unnecessary effects |
| UI composition | Start with free `dashboard-01` block; customize it | Avoid AI-generated inconsistent dashboards |
| Free enhancements | Choose eligible free Magic UI and Aceternity components only | No paid component dependency |
| Motion | GSAP for purposeful transitions; CSS otherwise | Performance and user control |
| Data charts/table | Recharts/shadcn charts, TanStack Table | Widely used tools and no paid component requirement |
| DB | PostgreSQL on Neon | Relational integrity and managed free-tier option |
| ORM | Prisma 7 + PostgreSQL driver adapter | Learn schema/migrations and type-safe access |
| Auth | Better Auth sessions | Avoid handcrafted password/session security |
| Validation | Zod on server; friendly form feedback | Trust boundary enforcement |
| Tests | Vitest for unit/integration; Playwright for E2E | Different confidence levels |
| SCM/CI | GitHub Issues/Milestones/PRs + Actions | Professional workflow |
| Hosting | Vercel (Next.js), Neon (PostgreSQL) | Simple initial delivery |
| Package manager | npm for reproducible beginner instructions | Clear Windows support and lockfile |
| Runtime | Node.js 22 LTS+ (check Next.js minimum) | Modern supported Node runtime |

**Version discipline:** pin dependencies in `package-lock.json`, upgrade deliberately after reviewing release notes. Do not assume snippets from old tutorials work with the currently installed major version.

## 4. Users and permissions
**V0.1:** one administrator, manually provisioned; private dashboard. Better Auth stores the session, but *an authenticated account is not automatically an admin*. Authorization is enforced via a separate `AdminAccess` record keyed by the authenticated user ID. No public production sign-up. Development bootstrap is documented and must be disabled for deployment.

**V0.2:** owner/admin/staff roles with explicit per-action authorization; audit important mutations and protect every affected resource, not merely page links. Multi-company tenancy is excluded until a dedicated architecture/security milestone.

## 5. V0.1 functional requirements — must ship
**F-01 Authentication:** working sign-in/sign-out; server verifies session on protected pages and mutations; unauthorized access redirects or returns a denial. Admin access is explicitly granted. Production public sign-up disabled.

**F-02 Navigation/UI:** responsive dashboard shell, sidebar/top bar, light/dark mode, consistent typography, reusable form/dialog/table patterns, meaningful loading/success/error/empty states; no unusable hover-only actions on mobile.

**F-03 Category management:** create, list, rename and delete categories, unique normalized name (within the single business); prevent deleting categories used by products unless a deliberate reassignment workflow exists.

**F-04 Product management:** create, list, view, edit, archive and restore products. Fields: name, description, SKU (unique), category, price in decimal currency, stock as a nonnegative integer, optional image URL. Use archive rather than hard delete as the normal product action. Never permit negative stock/price or unauthenticated changes.

**F-05 Search/data tables:** server-side search, filter by category/status, stable sort, cursor or offset pagination with bounded page size, accurate count. User input must not become arbitrary SQL or unbounded queries.

**F-06 Analytics:** total active products, categories, low-stock count, out-of-stock count, inventory quantity and optional derived inventory value. Inventory value uses explicit definition: `SUM(price × stock)`, and is **not** revenue or purchase cost. Charts show actual product category/stock distribution.

**F-07 Quality:** unit tests for Zod validation and business rules; integration tests for representative database behavior on an isolated test DB; Playwright smoke tests for major flows; lint, typecheck and build in CI. Minimum acceptance tests are defined in `04_TESTING_PLAYBOOK.md`.

**F-08 Delivery:** deploy a **reviewed** release, configure secrets through environment variables, run migrations safely, document setup/rollback/known limitations, and tag a release.

## 6. Not in V0.1
Not included: customer checkout/storefront, card payment, real revenue claims, shipping integrations, live order fulfillment, staff invitations, advanced RBAC, file-upload processing, third-party billing, websockets, redis/queues, microservices, multi-tenancy, custom auth implementation, AI features, advanced chart effects, and paid component packs.

### V0.2 — operations extension (planned only)
- Order + OrderItem, order status state machine, transactional inventory changes, order history.
- Customer views, staff roles and permissions, audit logs, more realistic analytics and exports.
- InventoryMovement, adjustments and concurrency-safe stock reservations. Financial reporting requires defined order/payment semantics.

### V1.0 — production maturity (planned only)
- Tests at service, DB, UI and E2E levels with dedicated CI test database.
- Security review: Broken Object-Level Authorization, function-level authorization, CSRF/session configuration, input and output handling, upload safety, rate limits.
- Observability: logs, alerts, error reporting, health/uptime, operational runbooks.
- Reliability: backup/restore verification, migration safety, staging, rollback process, query profiling, index review, performance budgets.

## 7. Quality requirements / non-functional
- **Security:** server-side checks for *every* sensitive read and write; do not equate a hidden button with authorization. No secrets committed. No public sign-up for production. Never use actual customer data in demos.
- **Integrity:** FK constraints, unique SKU/category, DB transactions when one operation spans multiple writes; prevent negative stock and invalid currency values.
- **Reliability:** predictable error states; idempotency for external/retryable business operations in later milestones; pagination bounded to avoid overload.
- **Performance:** avoid N+1 queries, large client bundles and unnecessary animation; test real data volumes and indexes; accessible focus states and reduced motion support.
- **Maintainability:** feature-based modules, readable naming, documented decisions, tested business rules, purposeful abstractions. Avoid controller/service/repository ceremony until there is a real reason.
- **Accessibility:** keyboard navigation, semantic form labels, color contrast, reduced motion, mobile layout and clear validation messages.
- **Cost:** use free tiers and no paid UI kits; record host limits before usage grows. GitHub Actions/hosting quotas can change.

## 8. Suggested database model (initial)
- `User`, `Session`, `Account`, `Verification` generated by Better Auth (do not manually guess auth fields; use official CLI).
- `AdminAccess(userId unique, createdAt)` as explicit ownership authorization.
- `Category(id, name unique, createdAt, updatedAt)`.
- `Product(id, sku unique, name, description?, price Decimal(12,2), stock Int, imageUrl?, categoryId FK, createdAt, updatedAt, archivedAt?)`.
- Indexes: product by category, archivedAt, createdAt; evaluate search indexes with EXPLAIN as usage grows.

**Rules:** no product points at a deleted category; archive products rather than destroy record; use decimal for money (not floating point); stock is nonnegative. Product low-stock threshold initially `<= 5` and `> 0`, configurable later.

## 9. Key user journeys
**A. Login:** navigate to sign-in -> submit credentials -> Better Auth creates session -> protected layout validates user and AdminAccess -> dashboard. Wrong credentials show generic failure. Signed-in non-admin user receives denial.

**B. Add category:** navigate categories -> submit name -> normalize + validate -> enforce permission -> persist under unique constraint -> show updated list. Duplicate name rejected visibly.

**C. Add product:** product form -> server validation -> admin verification -> ensure category exists -> store product -> revalidate list/metrics -> see product in table. Duplicate SKU, negative stock/price, invalid category must fail safely.

**D. Product lifecycle:** filter/search -> open product -> edit -> archive -> excluded from active counts -> restore -> visible again.

**E. Deploy:** branch -> PR -> lint/types/unit/build -> review -> merge -> preview/prod -> verify smoke checklist -> release tag. Never push DB secrets or direct-write destructive migrations to production without a review.

## 10. Server architecture and trust boundary
```
Browser user interaction
  -> Next.js Server Action / Route Handler / Server Component
  -> session + server-side permission check
  -> validate untrusted input (Zod)
  -> domain rule / use-case function
  -> Prisma query with DB constraints/transaction
  -> return safe result / revalidate / render UI
```
Do not fetch internal database data through a redundant public HTTP endpoint from a Server Component. Query server-only modules directly. Expose Route Handlers when external consumers/webhooks actually need HTTP. Both entry points still require independent auth/validation.

## 11. UI product direction
**Hybrid SaaS:** polished, restrained, responsive, works in dark/light theme. Begin from free `npx shadcn@latest add dashboard-01` (confirm command at time of usage). Use prebuilt accessible components, then customize colors, typography, hierarchy, spacing and empty states. GSAP is optional for KPI entrances and contextual transitions; charts use chart-library animations. Prefer CSS transitions for simple interaction. Respect `prefers-reduced-motion`. Never depend on a paid UI asset. Save `docs/UI_DECISIONS.md` when choosing a specific visual reference.

## 12. Project management and delivery plan
Time target for **V0.1 initial demonstration**, not mastery guarantee: **2–3 focused days**, highly dependent on debugging/setup; the security/quality gate may extend that. Treat all larger planned features as subsequent milestones; ship only after acceptance tests.

| Milestone | Objective | Core evidence |
|---|---|---|
| M0 — Specification & repo | Source of truth, decisions, GitHub project, issues, base app | Approved spec, issue board, repo initialized |
| M1 — UI shell | Professional UI, routes, responsive nav, theme | Mobile/desktop review, keyboard navigation |
| M2 — Auth & database | Prisma schema, migrations, Better Auth, AdminAccess | Protected routes; no public prod signup |
| M3 — Catalog workflows | Category & Product CRUD, validation, search, archive | Successful real DB flows and negative tests |
| M4 — Analytics & launch | Accurate stats, CI, tests, deploy, release | Green checks, smoke report, tag |
| M5 — Orders/stock | Real workflows, transactions, concurrent updates | Domain and DB integration tests |
| M6 — Team & audit | RBAC, access control, logs | BOLA/BFLA tests, audit evidence |
| M7 — Operational maturity | Observability, performance, security, reliability | Runbooks, staging, backup/restore exercises |

See `03_GITHUB_DEVOPS.md` for issue-by-issue work breakdown and exact instructions.

## 13. Definition of done, applied to every feature
1. Requirement & acceptance criteria explicit in the issue.
2. Server-side authz, input validation and error handling considered.
3. Happy path **and** negative tests written/run where feasible.
4. Data model/migrations reviewed; indexes/transaction needs considered.
5. Responsive, keyboard usable, loading/empty/error states documented.
6. Lint/typecheck/unit/build pass; integration/E2E checks executed for relevant flows.
7. PR describes intent, screenshots, manual tests, migration/env changes and rollout risk.
8. Merged/released only after verification; docs updated.

## 14. Current implementation truth and known limits
**At the time this document is created:** the application has **not** been built, deployed or verified against a live database. This bundle contains a planning specification, learning playbooks, starter overlay, templates and sample tests. The starter is **not** claimed to be an already-working production build; package installation and database-dependent tests could not be run in the document-generation environment. See `starter/README.md` and `06_RUNBOOK_TROUBLESHOOTING.md`.

**Known hazards:** third-party package changes; Prisma 7 driver adapter/ESM setup; Better Auth-generated models and migration; GitHub Actions cannot build without expected environment; preview/test DB isolation; Vercel environment variables; stock race conditions once orders ship. Mitigations are documented in the corresponding guides.

## 15. Future-chat handoff instructions (copy with this file)
You are continuing **ControlDesk**. Read `00_SOURCE_OF_TRUTH.md` first, then the other docs. Respect the agreed scope: one Next.js App Router full-stack e-commerce admin panel, free polished components, PostgreSQL/Prisma 7, Better Auth, GSAP selectively, testing and GitHub process. No Express/microservices as initial architecture. Prioritize explaining the first principle and request lifecycle before code. Work one GitHub issue/vertical slice at a time. Do not invent completion status; ask for actual repository files/logs if debugging. Never expose secrets. Verify library version/official docs before writing version-sensitive commands. Update the source of truth when decisions truly change.

## 16. Learning pack and verification addendum (reviewed 14 October 2026)

The source of truth is a **requirements/handoff document**, not an assertion of completed engineering work. The complete pack includes a guided implementation overlay plus five newly reviewed in-depth chapters:

- `docs/10_GITHUB_HANDS_ON_LAB.md`: exact first GitHub repository, Milestone, Issue, Project, branch, PR, CI, release exercises;
- `docs/11_TESTING_HANDS_ON_LAB.md`: why/how to test, first failing unit test, integration design, Playwright and security gates;
- `docs/12_UI_IMPLEMENTATION_SPEC.md`: reusable free component sources, theme/layout/page specifications and visual evidence rules;
- `docs/13_FEATURE_IMPLEMENTATION_RECIPES.md`: issue-by-issue design/implementation/test sequences through v1.0;
- `docs/14_AUDIT_AND_VERIFICATION.md`: inspected vs unexecuted checks, known limitations, trustworthy claims;
- `docs/15_BACKEND_MASTERCLASS.md`: transferable backend, API, SQL, concurrency, transaction and deployment principles.

**Environment caution:** No third-party account configuration or live Neon/Vercel deployment is included. Build, Prisma migration, authenticated flows, real tests, and CI must be performed and observed before declaring a milestone delivered. A private GitHub Free repository may not support enforced branch protection, so retain PR and CI discipline voluntarily (or use a supported plan).

## 17. Official references (checked October 2026)
- Next.js installation: https://nextjs.org/docs/app/getting-started/installation
- Next.js Server Actions/forms: https://nextjs.org/docs/app/guides/forms
- Next.js testing: https://nextjs.org/docs/app/guides/testing
- Prisma ORM 7: https://www.prisma.io/docs/orm/v7
- Prisma + PostgreSQL: https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/postgresql
- Better Auth + Next.js: https://better-auth.com/docs/integrations/next
- Better Auth Prisma: https://better-auth.com/docs/adapters/prisma
- shadcn free dashboard: https://ui.shadcn.com/blocks
- GitHub milestones: https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/creating-and-editing-milestones-for-issues-and-pull-requests
- GitHub Node CI: https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs
