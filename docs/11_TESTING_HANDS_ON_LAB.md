# Testing Hands-On Lab — Learn to Prove Your Application Works

**Goal:** Be able to decide what to test, write tests, run them, interpret failures, and prevent regressions without copying code blindly. **Testing is part of each GitHub Issue, not the last milestone.** We use **Vitest**, **Playwright**, and later a dedicated PostgreSQL integration database—not Python/pytest for this TypeScript project.

## 1. First principles: what can go wrong?

A feature specification is a claim. A test is repeatable evidence for a **part** of that claim. `product was saved` is not enough: what if the SKU already exists, the category was deleted, the actor has no permission, or the database is unavailable? Distinguish:

| Level | Example | Tools | Dependencies |
|---|---|---|---|
| Static checks | invalid TS types, formatting/lint | TypeScript, ESLint | source and installed deps |
| Unit | parser rejects stock -1; SKU normalization | Vitest | pure code, no DB |
| Component | form announces failure; pending button disabled | Testing Library / Vitest | DOM simulator |
| Integration | duplicate SKU is rejected by actual DB constraint | Vitest + **isolated** PostgreSQL | test DB and migrations |
| Server boundary | unauthorized mutation fails even bypassing UI | integration harness or Playwright | configured auth/session |
| E2E | admin signs in, adds product, sees live inventory KPI | Playwright | running app, dedicated DB, test user |
| Manual | keyboard and mobile, slow network, dark mode | browser dev tools | judgment/visual review |

No single layer replaces the others. Follow **Arrange → Act → Assert**. Cover *happy path, invalid input, boundary, denial, conflict, failure and recovery*.

## 2. Unit test lab, step by step (works without database after npm dependencies install)

Prerequisite: follow `02_BUILD_GUIDE.md` to generate the Next app, install dependencies, copy the starter's `vitest.config.ts`, `product.schema.ts`, and `product.schema.test.ts`; merge its `test` script into package.json.

Commands:

```powershell
npm run test
npm run test -- --reporter=verbose
npm run test:watch
```

Open `src/features/products/product.schema.test.ts`. Identify `describe`, `it`, `expect`, `parse`, and `safeParse`.

**Practice A (failure first):** add a failing test for SKU length 2. Run suite and read the failed assertion. Then confirm the actual `productInputSchema` rejects it; fix the test to assert that result. Test is green because behavior is correct, not because you deleted it.

**Practice B:** add the following extra negative test:

```ts
it("rejects a price above the 12-digit database precision budget", () => {
  const input = { ...valid, price: "12345678901.00" };
  expect(productInputSchema.safeParse(input).success).toBe(false);
});
```

Compare this assertion with the regex and with `@db.Decimal(12,2)`; learn the difference between 10 integer digits + 2 fractional digits and an arbitrary JS number. Never convert currency to floating-point for billing calculations; model exact decimals. For the MVP, money-like values are catalog prices, **not real payments**.

**Practice C:** for each invalid case, predict the output *before* running the test and write one sentence explaining what invariant it protects.

**Pass criteria:** at least one real failing run observed, corrected implementation/assertion, green run, and an explanation for each negative case.

## 3. Integration test design: a real database changes the risk

**Do not run write/cleanup integration tests against production Neon or a shared personal database.** First provision a disposable test DB or Neon development branch. Use environment variable `TEST_DATABASE_URL` and a script that explicitly refuses to run unless the hostname/db name matches a designated test target; do not merely copy `DATABASE_URL` into the test runner. Apply reviewed migrations to that test DB. Avoid risky bulk-delete examples until your test isolation is robust.

Suggested initial integration case: unique SKU. Arrange a test category and one test product with unique suffix in an isolated database; Act: attempt a second product with same SKU; Assert: Prisma reports unique conflict and only one record exists. Clean up *only records created by the test*, in the right FK order. Also verify foreign-key rejection for nonexistent category and DB CHECK constraints for stock/price if added.

Pseudo-test structure:

```ts
// PSEUDOCODE — adapt to your guarded test client and ephemeral test database
const category = await testDb.category.create({ data: { name: uniqueName } });
try {
  await testDb.product.create({ data: productFixture(category.id, uniqueSku) });
  await expect(
    testDb.product.create({ data: productFixture(category.id, uniqueSku) })
  ).rejects.toMatchObject({ code: "P2002" });
  expect(await testDb.product.count({ where: { sku: uniqueSku } })).toBe(1);
} finally {
  await testDb.product.deleteMany({ where: { sku: uniqueSku } });
  await testDb.category.delete({ where: { id: category.id } });
}
```

The exact test harness is **not implemented in this starter**; complete this in M3/M7 when the isolated DB exists.

## 4. Server security test: don't confuse hidden UI with protection

Make an actor/operation matrix:

| Actor | View dashboard | Create product | Archive product |
|---|---|---|---|
| Anonymous | Deny/redirect | Deny | Deny |
| Signed-in non-admin | Deny | Deny | Deny |
| Admin | Allow | Allow | Allow |

For each denied operation, invoke the **server** through the actual entry point/session context, not just check whether the browser hides a button. `requireAdmin()` in the starter enforces an additional DB grant beyond the session. Layout guards protect screens; separate Server Actions and Route Handlers must *also* authorize each write/read as needed. Later v0.2 introduces resource-level authorization tests (BOLA), and function-level checks (BFLA).

## 5. Playwright lab: browser testing from zero

Prerequisites: run a local development server and ensure `/sign-in` renders. In terminal:

```powershell
npx playwright install chromium
npm run test:e2e
npx playwright test --ui
```

The starter's `e2e/sign-in.spec.ts` is an actual simple smoke test: it checks the heading, email input, password input, and sign-in button. It **does not test successful login or real database operations**. Read each locator and understand why user-visible labels are more reliable than brittle CSS class selectors.

**Practice A:** add an unauthenticated redirect test. It must use a fresh browser context without session cookies:

```ts
test("signed-out user cannot open dashboard", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in(?:\?|$)/);
});
```

**Practice B:** when isolated test DB/admin seeding is ready, add login and create-product browser test: navigate to `/sign-in`, fill accessible email/password fields from test-only env, click Sign in, assert heading on `/dashboard`, open Products, create uniquely named test category/product, refresh, assert product present. For archive action, assert product disappears from active list *and* dashboard count adjusts. Test user and credentials must be for the test environment.

**Practice C:** use `await page.setViewportSize({width:375,height:812})` and verify mobile nav is usable with keyboard and touch. Honor reduced motion for animations; assert the meaningful final state instead of waiting fixed seconds.

**Debugging:** use trace (`npx playwright show-trace <trace-path>`), browser screenshots and Playwright UI. Prefer `getByRole` / `getByLabel` / `getByText`; avoid `waitForTimeout(5000)` to paper over errors. The browser test won't prove concurrency or database invariants—that's what integration tests are for.

## 6. CI checks: interpret failures instead of fixing by guesswork

The supplied `.github/workflows/ci.yml` has these independent gates:

1. `npm ci`: lockfile and dependency reproducibility. Failure → verify Node/lockfile, **not** database.
2. `npx prisma generate`: generated types from Prisma schema. Failure → schema/config/import.
3. `npm run lint`: JS/TS code conventions. Failure → examine ESLint message and source line.
4. `npm run typecheck`: static TS correctness. Failure → identify incompatible types, not `as any`.
5. `npm run test`: unit tests. Failure → compare given/expected, inspect code and test assumptions.
6. `npm run build`: Next.js production compilation. Failure → deployment-sensitive errors, server/client boundaries, build-time DB assumptions.

**IMPORTANT:** No GitHub-hosted Playwright DB E2E job is included yet. That requires isolated test DB and browser dependencies. Add it in M7. Do not claim 'all E2E tests run in CI' until you configure it.

Example failure analysis journal:

```text
Issue: M3 / duplicate SKU
Expected: reject duplicate and show accessible error
Observed: raw P2002 exception surfaced to browser
Layer: Server Action / Prisma error mapping
Reproduction: create two products with same normalized SKU
Root cause: Prisma known error not mapped to UI state
Fix: handle P2002 without leaking internals
Tests added: duplicate SKU integration + visible UI message E2E
Evidence: PR link / green Actions run / screenshot
```

## 7. Manual QA release matrix

For each row, record tester, environment, date, result (pass/fail), and evidence:

- [ ] Anonymous opening a protected page is redirected; invalid session is rejected.
- [ ] Non-admin cannot invoke privileged mutation directly.
- [ ] Admin sign-in/sign-out actually works and session state updates.
- [ ] Invalid product name/SKU/stock/price/category fails without database write.
- [ ] Duplicate SKU/category gives readable conflict message; DB unchanged.
- [ ] Product sorting/pagination/search handle no matches and large page request.
- [ ] Archive excludes product from active list and counts.
- [ ] Real chart uses real DB output; no placeholder demo revenue shipped.
- [ ] Mobile layout and keyboard operations; light/dark contrast.
- [ ] Reduced-motion preference disables nonessential effects.
- [ ] Build, typecheck, lint, unit tests pass; CI run is green.
- [ ] Deploy uses distinct preview and production credentials/data.
- [ ] Deployment smoke check; logs don't expose credentials or stack traces.
- [ ] Migration status reviewed; backup and restore procedure exists before real customer use.

## 8. How much testing is enough?

For M3, minimum: unit tests for validation; DB integration for uniqueness/FK; browser smoke for authorization and create flow; manual accessibility review. Avoid optimizing for a magic coverage number. Start with **critical risk paths**, then add tests for every regression you fix. CI must be green **but green CI is evidence, not a guarantee**.

## 9. Useful official resources

- Vitest: https://vitest.dev/guide/
- Playwright getting started: https://playwright.dev/docs/intro
- Playwright locators: https://playwright.dev/docs/locators
- Next.js testing: https://nextjs.org/docs/app/guides/testing
- GitHub Node.js CI: https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs
