# Testing ControlDesk — From First Test to Release Confidence

This guide starts from **why we test**, not from memorizing a testing framework. You do not need Python's pytest for a TypeScript/Next.js app. Use **Vitest** for pure functions/components and **Playwright** for realistic browser behavior; integration tests exercise Prisma against a throwaway isolated database.

## 1. What is a test?
A test provides evidence that, under controlled conditions, observable behavior matches a requirement. A useful test has **Arrange -> Act -> Assert** (AAA): set up state, perform operation, check outcome. Example: “Given stock 0, when creating a product with stock -1, reject and do not persist it.” Tests can pass while the product is still wrong—because the test may encode the wrong assumption or ignore critical failure paths. Begin with requirements and invariants.

### Test pyramid / purposes
| Layer | Typical case | Tool | What it proves | What it does not prove |
|---|---|---|---|---|
| Unit | Product SKU/price/stock schema rejects invalid input | Vitest | Small rule behaves correctly | Real database or login |
| Component | Form displays validation feedback; button keyboard-usable | Testing Library/Vitest | Interactive component behavior | Server authorization |
| Integration | Duplicate SKU insert violates DB unique constraint | Vitest + isolated Postgres | Modules + real persistence | Full browser flow |
| API/Action | Non-admin denied after submitting server mutation | Integration harness/Playwright | Server permission enforcement | Every mobile interaction |
| E2E | Admin signs in, creates, edits, archives product | Playwright | Key user journey works across stack | Every concurrency edge |
| Manual exploratory | Mobile narrow, screen reader, degraded network, reduced motion | Browser tools | UX not fully captured by scripts | Automated regression |

**Risk-based prioritization:** authentication, authorization, stock integrity and data migrations deserve strongest coverage. A subtle animation deserves less coverage than an unauthorized product deletion. Test **boundary conditions** (empty, minimum, maximum, absent, invalid, duplicate), not just happy paths.

## 2. Your first pure unit test
For example, `src/features/products/product.schema.ts` exports `productInputSchema` (in starter). `src/features/products/product.schema.test.ts` checks a valid product and rejects blank name, negative stock, invalid price formats, invalid URL and overly long SKU. Unit tests require no database, session or browser.

Run:

```powershell
npm run test
npm run test -- --reporter=verbose
```

Prefer explicit error assertions over tests that only assert a function returned some object. Keep time and random inputs deterministic. Tests for app Server Components should generally be E2E because async Server Components are not reliably covered by ordinary Vitest component rendering.

## 3. Table-driven test design example
| Case ID | Given input | Expected behavior | Layer |
|---|---|---|---|
| PROD-001 | valid product, real category | product persisted, visible | integration+E2E |
| PROD-002 | blank name | helpful validation error, no DB write | unit+E2E |
| PROD-003 | stock `-1` | reject | unit+DB |
| PROD-004 | stock `2.5` | reject | unit |
| PROD-005 | invalid decimal `12.999` | reject | unit |
| PROD-006 | duplicate SKU | clear conflict; keep original unchanged | DB+E2E |
| PROD-007 | nonexistent category ID | reject safely | DB+E2E |
| PROD-008 | logged out actor | redirect/deny mutation | security/E2E |
| PROD-009 | signed-in non-admin | deny even direct action/API | security/integration |
| PROD-010 | archive product | excluded from active list/KPI | integration+E2E |
| PROD-011 | restore product | returns to active list/KPI | integration |
| PROD-012 | page size `1000000` | bounded query | unit/integration |
| PROD-013 | concurrent SKU duplicates | at most one committed | database |
| CAT-001 | duplicate normalized category name | DB unique collision handled | database |
| AUTH-001 | forged cookie / invalid session | protected endpoint denied | integration |
| AUTH-002 | signup against production-like config | rejection even by direct API call | security/integration |

## 4. Integration tests and isolated database
Unit tests should not talk to Neon. For integration tests use a **separate local/containerized Postgres test DB or a dedicated disposable Neon branch**. Never use production. Before suite: apply migrations to test database. Between tests: reset tables in safe FK order or wrap test data in isolated transactions; parallel suites should use independent names/schemas/databases. After: clean up. Confirm env host/name contains known test markers before truncating anything; destructive cleanup is never allowed against unknown URLs.

Transaction/concurrency test: create product stock `1`; launch two simultaneous attempts to decrement stock using conditional update (`updateMany` with `stock: { gte: 1 }`, `decrement: 1` in transaction). Exactly one should succeed, final stock `0`. If both succeed, inventory code is wrong. Use separate DB connections to expose races where appropriate.

Schema changes need integration tests for uniqueness and referential integrity, not just tests for Zod. Data access test queries should assert record **contents**, not only row counts.

## 5. E2E with Playwright
Install:

```powershell
npm install -D @playwright/test
npx playwright install
```

Configure `playwright.config.ts` with `testDir: './e2e'`, a local `webServer` that launches `npm run dev`, `baseURL: 'http://127.0.0.1:3000'`, and trace/screenshots on failure. The starter includes a **login screen smoke** that does not need test credentials. Once an isolated E2E DB and test admin are configured, add login and CRUD flows with unique test IDs. Avoid Playwright tests that mutate production/staging data.

Suggested E2E cases:
1. `/sign-in` visibly renders labeled email/password fields.
2. Unauthenticated navigation to `/dashboard` redirects.
3. Admin logs in and sees correct user info.
4. Admin creates a category and product; table shows row after refresh.
5. Invalid product input yields accessible errors and no persisted row.
6. Archive/restore changes active stats.
7. Responsive navigation works at 375px width and keyboard-only.
8. Production-like environment rejects sign-up requests, even if UI route hidden.

**Locator best practices:** prefer semantic roles, accessible names and unique labels; use `data-testid` only when semantic locators are inadequate. Wait for visible state or network result rather than hard-coded `waitForTimeout(5000)`. Do not assert screenshot pixel-perfect on dynamic/changing content without controlled fixtures.

## 6. Security tests are functional tests
Test differences among:
- **401 / redirect**: anonymous actor.
- **403**: signed-in but unauthorized actor.
- **404**: unknown record (sometimes deliberately also used to avoid disclosing existence).
- **409**: conflict such as duplicate SKU.
- **422**: input invalid.

Make a matrix: role × operation × object. For each endpoint or Server Action, attempt denied operations by invoking the server, **not** simply checking that a button is hidden. Test BOLA (guessing another object ID) and BFLA (accessing a privileged function). Distinct roles arrive in V0.2, but v0.1 already has anonymous, authenticated non-admin and admin states.

## 7. Test data fixtures and factories
Use deterministic input factories that produce valid products by default, then override one field per negative case. Example: `makeProduct({stock:-1})`. Use distinctive `e2e-<random>` names only in test DB so teardown can cleanly remove them. Tests must be independent—no reliance on the previous test having created category #3. Use fixture-level setup/teardown carefully; avoid sharing mutable global state.

## 8. Coverage and confidence
Line coverage is a useful signal, not a goal by itself. A test suite that touches 95% of lines but does not test unauthorized access is weak. Track a **requirements coverage table**: feature -> happy path -> failure cases -> unit/integration/E2E proof. Consider mutation testing when you are advanced enough. Verify each bug fix has a regression test that fails before the fix and passes afterward.

## 9. CI test stages
**For all PRs:** lint, typecheck, DB-free unit tests, build. **For integration PRs:** isolated test database and migrations (only after safely configuring one). **For release candidate:** authenticated Playwright E2E on staging/test environment. Avoid leaking secrets via Actions logs. Upload Playwright traces only when safe and needed. Do not grant untrusted PR jobs access to production DB.

## 10. Manual release test sheet
| ID | Check | Result (pass/fail) | Evidence |
|---|---|---|---|
| R-01 | Sign-in and sign-out | | |
| R-02 | Protected routes and server operations | | |
| R-03 | Non-admin access denied | | |
| R-04 | Create/edit/archive/restore product | | |
| R-05 | Duplicate SKU and invalid values | | |
| R-06 | Category FK behavior | | |
| R-07 | Search/pagination consistent | | |
| R-08 | Cards and charts match actual database | | |
| R-09 | Mobile, keyboard and dark theme | | |
| R-10 | CI green, release secrets configured, migration applied | | |
| R-11 | Observed runtime logs clean after smoke | | |

## 11. Debugging failing tests
- Reproduce failure locally with one test `npx vitest run path/to/test.ts` or `npx playwright test e2e/example.spec.ts --headed`.
- Read actual error and line before changing code. Ask: environment, state, timing, requirement or implementation problem?
- For flaky async test: use condition-based waits, controlled test data and clean isolation.
- For DB failure: inspect migration status, transaction boundaries, constraints and test DB URL.
- For UI discrepancy: check form submission payload, auth session, server logs, route revalidation and rendering mode.
- Fix the **root cause**, then add regression coverage.

## 12. Recommended practice progression
Week 1: Zod tests and first Playwright smoke. Week 2: Prisma integration tests, authz matrix. Week 3: CRUD E2E and PR CI. Week 4: order concurrency test and migration exercise. These are **suggestions**, not hard deadlines. You learn testing by discovering what can break and proving it cannot, not by memorizing Vitest APIs.

### References
- Next.js testing overview: https://nextjs.org/docs/app/guides/testing
- Vitest guide: https://nextjs.org/docs/app/guides/testing/vitest
- Playwright guide: https://nextjs.org/docs/app/guides/testing/playwright
- OWASP authorization testing concepts: https://owasp.org/www-project-web-security-testing-guide/
