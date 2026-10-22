# Progress Tracker / Independent Work Journal

Use this file in your local Git repository and update it after each work session.

## Current status (on document creation, 2026-10-14)
- [x] Requirements and architectural decisions documented
- [x] Self-study and test plans written
- [x] Starter overlay and templates packaged (see status in root README)
- [ ] Fresh Next.js app installed and dependencies fetched
- [ ] Neon development DB configured
- [ ] Better Auth schema generated and migrations applied
- [ ] Protected admin account provisioned
- [ ] Dashboard-01 integrated and designed
- [ ] Catalog features completed and tested
- [ ] GitHub milestones/issues/CI configured
- [ ] Vercel deployed and smoke-tested

## Verified status update (2026-10-22 — M3 Catalog)

- [x] Next.js application and pinned dependencies installed.
- [x] Prisma schema validates and Prisma Client generates with Prisma 7.10.1.
- [x] Existing Neon connection is reachable for migration-status inspection.
- [x] Dashboard shell, authentication integration and explicit `AdminAccess` checks exist.
- [x] Category create/list/rename/restricted-delete implementation is complete.
- [x] Product create/list/view/edit/archive/restore implementation is complete.
- [x] Product list uses PostgreSQL-backed search/filter/sort/count/pagination contracts.
- [x] DB-free validation, query-contract and mocked direct-action tests pass (53 tests).
- [x] TypeScript, ESLint and Next.js production build pass.
- [ ] Catalog database integration tests and authenticated browser smoke are pending an
  explicitly isolated test database/account. The configured database was not mutated.
- [ ] `20261022120000_harden_catalog_constraints` is reviewed but pending; apply only
  to an approved development/staging database after checking existing rows for conflicts.

### M3 implementation decisions

- Category names are canonicalized to trimmed, collapsed, lowercase text. An
  expression unique index backs normalized uniqueness.
- SKUs are editable, canonicalized to trimmed uppercase text and protected by an
  expression unique index in addition to Prisma's unique field.
- Product list contract: `q`, `categoryId`, `status=active|archived|all`,
  `sort=newest|oldest|name|price|stock`, and `page`; page size is fixed at 20.
- Products are archived through `archivedAt`; repeated archive/restore requests return
  a safe success message without changing an already-correct state.
- Categories with any linked products, including archived products, cannot be deleted.
- Because every dashboard route reads the authenticated request, the dashboard segments
  explicitly use Next.js 16.4 `instant = false`. This is the documented incremental
  Cache Components migration path; M4 may introduce finer Suspense boundaries.

### Verification evidence (2026-10-22)

- `npx prisma validate` — passed.
- `npx prisma generate` — passed; generated Prisma Client 7.10.1.
- `npx prisma migrate status` — connected; reported the new hardening migration pending.
- `npx tsc --noEmit` — passed.
- `npm run lint` — passed with zero warnings after cleanup.
- `npx vitest run` — passed: 5 files, 53 tests.
- `npm run build` — passed with Next.js 16.4.2 after using the installed-version
  authenticated Cache Components guidance.
- Database integration and Playwright — not run; no dedicated test database or E2E
  admin credentials were identified. Never point those suites at the current database.

## Session note template
**Date:**  
**Issue/milestone:**  
**Problem we are solving:**  
**Trust boundary/invariants:**  
**My pseudocode before asking AI:**  
**What I changed:**  
**Tests I ran + actual results:**  
**What failed and why:**  
**Commit/PR reference:**  
**What I can explain from memory:**  
**Next small step:**  

## Review rubric
Rate 0 = not yet, 1 = can repeat with help, 2 = independent, 3 = can explain and review someone else's implementation.

| Skill | 0-3 | Evidence (issue/test/diagram) |
|---|---|---|
| HTTP/request lifecycle | | |
| Session and authorization | | |
| Validation/business rules | | |
| DB modeling/migrations | | |
| Indexes/transactions | | |
| React rendering/components | | |
| Unit/integration/E2E tests | | |
| Git/PR/milestones | | |
| CI/CD/release | | |
| Debugging/observability | | |

Do not claim completion if a feature is only planned, screenshot-only, or not tested.
