# Independent Audit, Verification Matrix and Known Limits

**Review date:** 14 October 2026. **This is a plan and instructional code overlay; it is NOT a verified finished production app.** This document is the trust ledger you should hand to any future collaborator or AI assistant.

## 1. What the bundle actually contains

| Item | Included? | Verified status |
|---|---|---|
| Project charter, features, version scope, non-goals | Yes, `00_SOURCE_OF_TRUTH.md` | Reviewed for alignment with user decisions |
| First-principles learning | Yes, `01` + `15` | Written explanation; not a course with formal assessment |
| Stepwise setup (Windows/npx/npm/Neon/Prisma/Better Auth) | Yes, `02` | Based on official docs; unexecuted here |
| GitHub UI clicks and command practice | Yes, `03` + `10` | Cross-checked against GitHub docs; your account UI may differ |
| Issues, milestones, Project board, PR, self-review | Yes, `10` + templates/backlog | Workflows explained; not created in your account |
| GitHub Actions CI workflow | Yes, `starter/.github/workflows/ci.yml` | YAML provided; not executed in GitHub |
| CI/CD deployment and rollback concepts | Yes, `03`, `10`, `13` | Process described; not deployed |
| Vitest unit tests | Yes, limited starter example | Source reviewed; dependencies not installed/executed |
| Playwright E2E | Yes, login-screen smoke only | Source reviewed; browser tests unexecuted |
| Integration/security/concurrency tests | Plans and examples | NOT implemented or run |
| Working Next.js admin shell | Guided starter overlay | NOT executed end-to-end |
| Catalog create/list/archive starter | Selected guided files | NOT fully verified; editing/restore/filter advanced pending |
| UI component strategy, pages and QA | Yes, `05` + `12` | Specified, not actually installed/shown working |
| Version 0.2 orders/team/audit | Requirements + recipes | Planned only |
| Version 1.0 hardening | Requirements + recipes | Planned only |

**Distinguish three evidence labels:** `documented`, `code included but unverified`, `tested against running environment`. Never use “production ready” before the third exists plus quality criteria pass.

## 2. Real findings from the review

1. **Original GitHub guide was not beginner-deep enough.** Added `10_GITHUB_HANDS_ON_LAB.md`, including repo, milestone, Issue, Project, branch, PR, CI, merging and release exercises.
2. **GitHub Free private branch protection limitation.** Explicitly noted in `03` and `10`: GitHub Free supports protected branches in public repositories; private repos generally require Pro/Team/Enterprise. Practice voluntary PR and passing CI regardless.
3. **Testing pack had just a small validation suite + sign-in UI smoke.** Added `11_TESTING_HANDS_ON_LAB.md` with failing-test practice, DB isolation, security matrix and authenticated E2E plan. This still does not constitute a complete runnable integration suite.
4. **UI was too abstract.** Added `12_UI_IMPLEMENTATION_SPEC.md` for exact free component source, screen definitions, data states, visual tokens, licensing and screenshot acceptance.
5. **Issue titles needed implementation recipes.** Added `13_FEATURE_IMPLEMENTATION_RECIPES.md` with order, data invariants, negative cases and deliverables through v1.0.
6. **Backend “why” needed greater depth.** Added `15_BACKEND_MASTERCLASS.md` with HTTP, authority, schema, concurrency, observability and API contract mental models.
7. **No guarantee of latest npm compatibility.** Recommendations checked against official sources, but actual resolved package versions, transitive dependencies, builds and migrations **must be verified by installing and running locally**. Pin tested versions in `package-lock.json`; review docs when a major version changes.

## 3. Version and compatibility checkpoints (before coding)

1. Record `node -v`, `npm -v`, `npx next --version`, `npx prisma --version`, `npm ls better-auth @better-auth/prisma-adapter prisma @prisma/client @prisma/adapter-pg next react` once installed.
2. Prisma **7** generator requires explicit output and PostgreSQL adapter for runtime. Verify generated client import path from schema, not memory. Official: https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/introduction
3. Better Auth Prisma CLI generates schema but **does not apply migration**; review generated models and run Prisma migration yourself. Official: https://better-auth.com/docs/adapters/prisma
4. Better Auth `emailAndPassword.disableSignUp` is documented and should be tested by a direct POST to signup in a production-like **test environment**, not just by hiding a page. Official: https://better-auth.com/docs/reference/options
5. Next.js App Router route handlers, Server Components and Server Actions vary by version; compare version-specific docs before using a new feature. Official: https://nextjs.org/docs/app
6. shadcn `dashboard-01` remains a demo scaffold, not an authenticated working admin. Verify installation target and all overwritten files. Official: https://ui.shadcn.com/blocks?category=dashboard
7. GSAP and optional third-party components must be used subject to license, bundle size, SSR safety and reduced-motion requirements. Re-check at use time.
8. CI Node version must satisfy **the installed Prisma/Next toolchain**. Starter YAML uses Node 22; check the exact minimum patch level. Lock versions/CI environment intentionally rather than asserting all majors work together forever.

## 4. Local acceptance sequence

Use a **development** Neon DB, never production for initial testing.

```powershell
node -v
npm -v
npm install
npx prisma validate
npx prisma generate
# IMPORTANT: only against your approved DEVELOPMENT_DATABASE_URL/DATABASE_URL:
npx prisma migrate dev
npm run lint
npm run typecheck
npm run test
npm run build
npm run dev
```

If this is the initial project setup, follow `02_BUILD_GUIDE.md` for the correct install/migrate order; do **not** paste this block blindly. Then do manual admin sign-in, create category/product, verify persistence, invalid input and authorization, examine browser console/Network, run `npm run test:e2e` after Playwright browser install. Capture exact error output if any stage fails.

**Do not claim working/deployed without:** green local static/test/build, migration on isolated dev DB, authenticated full flow in browser, green GitHub CI, Vercel staging smoke and security/permissions checks.

## 5. Production readiness gates

- [ ] Clear product requirements, actual feature list and explicit non-goals.
- [ ] No committed secrets, test accounts, or real customer information.
- [ ] Role and object-level authorization enforced on server for each entry point.
- [ ] Input schemas + DB constraints verified; error messages safe.
- [ ] Migrations reviewed, applied on staging, and safe deploy order documented.
- [ ] Consistent indexes/query limits; no unbounded data extraction.
- [ ] Testing evidence for critical business logic, auth, DB rules and browser flows.
- [ ] All CI jobs green; deployment has independent environment configuration.
- [ ] Backups/restore rehearsal, monitoring and incident response for real production use.
- [ ] Audit logs for privileged actions once team management is enabled.
- [ ] Accessibility, mobile, reduced motion and component license checks.

## 6. Handoff prompt to a future assistant/developer

> Work on **ControlDesk**. Read `docs/00_SOURCE_OF_TRUTH.md`, `docs/14_AUDIT_AND_VERIFICATION.md`, `docs/07_PROGRESS_TRACKER.md`, and the current Issue/PR. This project is **planned + partly scaffolded, not automatically running**. Follow the Next.js single-app architecture, free prebuilt shadcn dashboard foundation, Prisma 7 + Neon, Better Auth, Vitest/Playwright, and GitHub issue → branch → PR → CI workflow. Start by inspecting the local repo and verifying actual installed dependencies. Do not replace architecture, invent UI demo data, or claim verification without running tests. Implement one small issue at a time and update progress tracker, tests, and documentation.

## 7. Reference links verified when authored

- GitHub Milestones: https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/creating-and-editing-milestones-for-issues-and-pull-requests
- GitHub Projects: https://docs.github.com/en/get-started/start-your-journey/planning-your-work
- GitHub branch protection availability: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches
- GitHub Actions for Node.js: https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs
- Next.js: https://nextjs.org/docs/app
- Prisma 7 client: https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/introduction
- Better Auth Prisma adapter: https://better-auth.com/docs/adapters/prisma
- shadcn UI Blocks: https://ui.shadcn.com/blocks?category=dashboard
