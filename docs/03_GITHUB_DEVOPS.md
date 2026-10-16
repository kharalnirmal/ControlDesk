# GitHub, Milestones, Pull Requests & DevOps — Full Manual Workflow

The professional pattern is **plan -> issue -> branch -> change -> test -> PR -> review -> merge -> deploy -> monitor**. Git is the local version-control tool; GitHub hosts collaboration/project workflows; Actions automates checks; Vercel hosts the application. A **milestone** groups issues toward a feature or release. A **GitHub Project** is a board showing statuses across tasks; they are different tools.

## 1. Repository setup (Windows PowerShell)
Create a private GitHub repository called `controldesk` using GitHub's **New repository** screen. Do not initialize the remote with a README if `create-next-app` already made one. In local project:

```powershell
git status
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/controldesk.git
git add .
git commit -m "chore: initialize Next.js application"
git push -u origin main
```

If `git remote add origin` says remote exists, use `git remote -v`, **do not** blindly overwrite; compare URLs. If the CLI initialized Git and produced the initial commit, do not create a redundant first commit. Before each push run `git status` and `git diff --cached` to ensure `.env` or tokens are not staged. `git status --short` is a quick sanity check.

GitHub authentication may use browser credential manager or GitHub CLI; don't paste personal tokens in terminal history or into this guide.

## 2. Milestones (exact web UI)
Repo -> **Issues** -> **Milestones** beside issue search -> **New milestone** -> enter title/description -> optional due date -> **Create milestone**. If Issues is hidden, repo Settings -> Features -> enable Issues (permissions required). After creating an Issue, set its milestone in the right sidebar. Its progress is calculated from associated open/closed items. Keep milestones outcome-oriented, not calendar-only.

Create these 8 milestones:

| Title | Definition of done | Release |
|---|---|---|
| M0 — Spec & Repo | Requirements, roadmap, Git setup, decision log | planning |
| M1 — UI Shell | Accessible responsive scaffold and components | v0.1 |
| M2 — Database & Auth | Migrations, session protection, admin bootstrap | v0.1 |
| M3 — Catalog | Categories/products CRUD, filters, tests | v0.1 |
| M4 — Analytics & Deploy | Real KPIs, charts, CI, deploy checks | v0.1 |
| M5 — Orders & Inventory | Transactions, stock updates, order flows | v0.2 |
| M6 — Team & Audit | Role permissions, activity history | v0.2 |
| M7 — Production Hardening | Monitoring, full tests, backup/restore, perf | v1.0 |

Each milestone due date is optional; don't mark done based only on elapsed days. For GitHub Project: GitHub profile/organization -> Projects -> New Project -> Board -> add repository issues -> use **Todo / In Progress / In Review / Done** statuses.

## 3. Issue titles and acceptance criteria
Use issue templates provided in `.github/ISSUE_TEMPLATE/` in the bundle. Avoid vague issues like “make backend.” Each issue must be finishable and testable, e.g. `feat(catalog): reject duplicate product SKUs` with context, user story, scope, non-goals, cases and proof. Assign labels such as `feature`, `bug`, `backend`, `frontend`, `security`, `testing`, `devops`, `docs`, `priority-high`.

### Full backlog (suggested, split if needed)
**M0**: #1 Approve source of truth; #2 Initialize Next repo + README; #3 Create GitHub milestones and issue board; #4 Document design system, env and decision log.

**M1**: #5 Install free dashboard-01 on a branch; #6 Implement responsive navigation and dashboard shell; #7 Add light/dark mode; #8 Standardize form/table/loading/error UI; #9 Check accessibility and mobile layouts.

**M2**: #10 Configure Neon + Prisma 7 client; #11 Model Category/Product/AdminAccess with constraints; #12 Create first migration; #13 Integrate Better Auth schema/session; #14 Provision admin safely and disable production public sign-up; #15 Add authz denial tests.

**M3**: #16 Category CRUD + unique-name validation; #17 Product create with SKU/price/stock checks; #18 Product list with server filtering, sort, pagination; #19 Edit/Archive/Restore; #20 Catalog tests and empty/error/loading states.

**M4**: #21 DB-backed KPI cards; #22 Real category/stock chart; #23 Vitest/Playwright smoke baseline; #24 Actions lint/typecheck/test/build; #25 Vercel/Neon preview and production separation; #26 production smoke/release notes/v0.1.0.

**M5**: #27 Define order state diagram; #28 Order/OrderItem schema + migrations; #29 Transactional stock decrement/restore with conditional updates; #30 Concurrency integration test; #31 Order history UI.

**M6**: #32 Permission matrix; #33 Staff roles; #34 Admin-only functions and per-object authorization tests; #35 Audit log schema and event writing; #36 Access review.

**M7**: #37 Logging/error monitoring; #38 Dedicated test/staging DB and E2E CI; #39 Benchmark queries + indexes; #40 Rate limiting and abuse controls; #41 Verify backups/restore; #42 Release runbook, rollback drill and documentation audit.

These issue numbers are **planning IDs**, not GitHub-issued numbers. GitHub assigns real numbers when created. Copy the titles, then link to the matching milestone.

## 4. Branches and commits

```powershell
git checkout main
git pull --ff-only origin main
git switch -c feat/product-create
# make small change; inspect
git status
git diff
git add src/features/products src/app
# inspect staged content
git diff --cached
git commit -m "feat(catalog): validate product creation"
git push -u origin feat/product-create
```

Use `feat/`, `fix/`, `test/`, `docs/`, `chore/` prefixes, kebab-case names. Write commit messages explaining the change, not “done” or “updated”. Commit secrets **never**. Prefer small focused commits; a PR may contain several related commits.

## 5. Open and review a Pull Request
GitHub -> repository -> **Pull requests** -> **New pull request** -> base `main`, compare `feat/...` -> write summary, issue linkage (e.g. `Closes #17`), screenshots, tests, migration/env changes -> Create PR. Check **Files changed** and automated status. Fix failures locally, commit/push to same branch, review again. Even working alone, write a self-review before merging. Merge only when CI passes and relevant acceptance criteria are proven. Use **Squash and merge** if appropriate. After merge:

```powershell
git switch main
git pull --ff-only origin main
git branch -d feat/product-create
git fetch --prune
```

Avoid force-pushing shared branches unless you understand consequences. Do not `git push --force` to main.

## 6. GitHub branch rules
Repo Settings -> Rules -> Rulesets (or Branches/branch protection, according to UI) -> create protection for `main`: require Pull Request before merge, require status checks after CI names are stable, block force pushes, optionally require review and up-to-date branch. **Important GitHub Free caveat (verified October 2026):** enforced branch protection is available for **public** repositories on GitHub Free; **private** repository protection generally requires GitHub Pro/Team/Enterprise. If you choose a private repo on Free, practice branch + PR + CI + self-review voluntarily even when GitHub cannot enforce required checks. Do not make the repository public just to unlock protection if it could expose secrets or private data. See `10_GITHUB_HANDS_ON_LAB.md` for the exact practical workflow. Verify Actions workflow permissions: read-only is enough for CI; do not give a testing workflow production deploy permissions.

## 7. CI vs CD explained
**Continuous Integration:** every PR proves the code installs, generates Prisma Client, passes lint/types/tests/build. **Continuous Delivery:** after successful review/merge the release is ready to deploy. **Continuous Deployment:** passing approved change is deployed automatically; Vercel Git integration can handle deployment on merged main. **DevOps** is the ongoing shared engineering practice around build, deploy, secure, monitor and recover—not merely learning Docker or GitHub Actions syntax.

### CI workflow instructions
Use `starter/.github/workflows/ci.yml` when the Next app contains matching scripts. `npm ci` requires committed `package-lock.json`. `prisma generate` requires schema and dependencies. A **dummy** `DATABASE_URL` for build steps should never be used to run migrations, integration tests, or deploy. Unit tests should be DB-free; integration tests need a dedicated temporary database. Keep network/production credentials out of untrusted PRs.

### CI failure diagnostic map
- Install fails -> stale/missing lockfile or Node mismatch. Rerun `npm install` locally; commit changed lockfile.
- Prisma client missing -> `prisma generate` stage or output-path issue.
- Type errors -> compare generated type and import; do not silence with `any`.
- Build fails -> missing env, code using browser APIs server-side, static prerender touching DB.
- Tests flaky -> uncontrolled time/state/network, shared DB, missing cleanup.
- Deployment succeeds but app 500 -> environment variables, migration not applied, runtime incompatibility, logs.

## 8. Vercel deployment & environments
1. Link GitHub repo to Vercel.
2. Configure build command `npm run build` and framework Next.js.
3. Set **environment-specific** `DATABASE_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET` via Vercel settings (never in code).
4. Use isolated Neon DBs for preview/staging vs production before testing mutations or migrations.
5. Apply reviewed migrations with `npx prisma migrate deploy` using authorized DB credentials; Vercel build does not implicitly migrate the DB.
6. Check logs, run smoke checklist, verify auth and correct URL/cookie behavior.
7. Tag release:

```powershell
git tag -a v0.1.0 -m "ControlDesk MVP"
git push origin v0.1.0
```

**Rollbacks:** GitHub revert or Vercel prior deployment may restore application code. A DB migration that removed/renamed columns may not be reversible by rolling back code. Prefer backwards-compatible expand-and-contract schema changes and forward fixes after a reviewed incident.

## 9. Debugging Git like a professional

```powershell
git status
git log --oneline -10
git branch -vv
git remote -v
git fetch origin
git diff main...feat/product-create
git show --stat HEAD
git reflog
```

`git pull` fetches plus integrates changes; `git fetch` inspects remote changes without merging. `git rebase` rewrites commits; avoid rebasing shared history without understanding its effect. `git stash` temporarily saves an uncommitted worktree state but is not a backup.

## 10. Professional repo deliverables
Repository contains README (what, quickstart, screenshots, status), `docs/` including spec/architecture/decision records, `.env.example`, license if desired, issue/PR templates, CI, lockfile, and tests. Add a GitHub release with changelog when v0.1.0 is actually accepted. A polished README does not substitute for working tests.

### References
- GitHub milestone creation: https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/creating-and-editing-milestones-for-issues-and-pull-requests
- GitHub Actions for Node.js: https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs
- GitHub Issues and Projects: https://docs.github.com/en/issues
