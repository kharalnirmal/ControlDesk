# Build Guide — Windows + npm, from empty folder to deployed MVP

**Read first:** `00_SOURCE_OF_TRUTH.md`. Do not paste commands until you understand what they change. Commands use **PowerShell**. For any CLI whose installed version differs from the documented major, verify the official docs before proceeding. **No secret keys are supplied in this bundle.**

## 0. Environment checklist
Install a current supported Node.js LTS version (use **Node 22.18+ or 24 LTS** when supported by your installed packages; compare official Next.js/Prisma version requirements before starting), Git, VS Code, and a browser. Check versions:

```powershell
node -v
npm -v
git --version
```

Sign up for GitHub, Neon, and Vercel using your own accounts. Protect accounts with MFA. Set Git identity:

```powershell
git config --global user.name "Your Name"
git config --global user.email "your-github-email@example.com"
git config --global init.defaultBranch main
```

No Python required. We use npm and Node.js/Next.js TypeScript. Do not mix Bun/yarn/npm lockfiles; this guide standardizes on `package-lock.json`.

## 1. Scaffold Next.js (M0)

```powershell
npx create-next-app@latest controldesk --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd controldesk
npm run dev
```

Visit `http://localhost:3000`. Stop the dev server with Ctrl+C. The CLI creates the app skeleton, TypeScript configuration, ESLint and Tailwind. Verify `src/app` exists. Do not overwrite `package.json` wholesale with the starter bundle; install only what you need and add scripts.

**Repository:** initialize if not already initialized by the CLI; `git status`, then create a private GitHub repository with no duplicate generated README, attach remote, and push. Exact commands in `03_GITHUB_DEVOPS.md` and a beginner-friendly first PR lab in `10_GITHUB_HANDS_ON_LAB.md`.

## 2. Read and apply the starter overlay (M0/M2/M3)
`starter/` is a **guided source overlay**, not an already-installed app. Each file has a relative destination under the generated Next.js root. Copy `starter/src/...` into `src/...`, `starter/prisma/schema.prisma` into `prisma/schema.prisma` and `starter/prisma.config.ts` to project root. Copy GitHub workflow from `starter/.github/workflows/ci.yml` when ready. **Order matters:** initial Prisma Client must be generated before Better Auth's schema generator can import the auth configuration.

The overlay uses plain Tailwind layout so you can confirm functionality before replacing visuals. The final Hybrid SaaS visual is built in M1 with a free component block. See `12_UI_IMPLEMENTATION_SPEC.md` for a component-by-component visual contract and migration strategy. You should not blindly overwrite the route `src/app/dashboard/page.tsx` when installing a dashboard block; preserve and reapply the server-side auth gate.

## 3. Install Prisma 7 and PostgreSQL driver adapter

```powershell
npm install @prisma/client@7 @prisma/adapter-pg pg dotenv zod better-auth @better-auth/prisma-adapter
npm install -D prisma@7 tsx @types/pg vitest @playwright/test
npx prisma init --datasource-provider postgresql --output ../src/generated/prisma
```

If `prisma init` creates a config/schema, preserve the generated client output path but **replace** the schema only once you've inspected the generated contents. Do not run initialization twice. The source overlay expects `prisma.config.ts`, `prisma/schema.prisma`, `src/generated/prisma` output and `src/lib/prisma.ts`. Use **matching Prisma CLI and Client major versions**.

### Neon configuration
Create a new development database. Copy its PostgreSQL URL. For the first working version we use one `DATABASE_URL`, consistent with the initial learning preference. You may later choose a separate `DIRECT_URL` for migrations and pooled `DATABASE_URL` for the deployed runtime (recommended when pooler behavior or migration limitations require it). **Never commit either.**

Create `.env` in project root using the template `starter/.env.example`:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@YOUR-NEON-HOST/DB?sslmode=require"
BETTER_AUTH_SECRET="REPLACE_WITH_A_LONG_RANDOM_SECRET"
BETTER_AUTH_URL="http://localhost:3000"
```

Generate a secret in Node on your local computer:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Check `.gitignore` excludes `.env*` while **allowing** `.env.example`. Never screenshot/share this value. The config file reads `DATABASE_URL` and Prisma runtime passes it into `PrismaPg`, required by Prisma 7.

### Generate baseline and migrate

```powershell
npx prisma generate
npx prisma migrate dev --name catalog-baseline
npx prisma generate
```

Do not run `migrate reset` if asked to reset data. Inspect what differs first. `prisma migrate dev` is for your **development database only**. `migrate deploy` is used for reviewed migrations during deployment.

## 4. Add Better Auth (M2)
Better Auth has its own database models. **Do not copy a guessed auth table schema.** The server setup is in `src/lib/auth.ts` and `src/app/api/auth/[...all]/route.ts` from the overlay; the basic client wrapper is `src/lib/auth-client.ts`.

Run the official Better Auth schema generator after the baseline Prisma client exists:

```powershell
npx auth@latest generate
```

**Review the schema diff** before migration. Confirm the generated authentication models (User, Session, Account, Verification) have been added without deleting catalog models. If the auth CLI cannot locate `src/lib/auth.ts`, consult its CLI `--config` option and current docs. Then:

```powershell
npx prisma migrate dev --name add-auth
npx prisma generate
```

The auth adapter imports from `better-auth/adapters/prisma` in the documented integration. Keep packages aligned with the version you install. For local bootstrapping, sign up through the development-only signup page, then use Prisma Studio to create `AdminAccess` with `userId` equal to that user's `User.id`. **Production sign-up must be disabled in Better Auth configuration, not merely hidden in the UI.** Our overlay sets `disableSignUp: process.env.NODE_ENV === 'production'`. Verify it by making a signup API call against a deployment test environment and confirming rejection. Note: Vercel Preview builds also set `NODE_ENV=production`, so create accounts locally in development and use a proper invitation workflow before supporting production account creation.

```powershell
npx prisma studio
```

After creating AdminAccess, sign out and back in. Confirm a signed-in non-admin user is **denied**, and an admin can access `/dashboard`.

## 5. Understand the data model before CRUD (M3)
Use `Category` and `Product` from the starter schema. Initial rules:
- Category names are trimmed, case normalization policy documented and duplicates rejected by DB uniqueness.
- Product SKU is unique; stock integer `>= 0`; price is a decimal string, nonnegative; category must exist.
- Products archive via `archivedAt` and are normally filtered out of active lists/metrics.
- DB constraints provide the final safeguard for concurrent writes; Zod alone is insufficient.

Recommended UI feature slices in order:
1. Category create/list, duplicate handling, delete restriction.
2. Product create with category selector, server validation, status feedback.
3. Product list with stable ordering, bounded pagination, search/category/status filters.
4. Product detail/edit; SKU conflicts; archive/restore; revalidation.
5. Accurate dashboard statistics and category distribution chart from DB.

For each slice: open one GitHub Issue -> write negative tests -> implement -> lint + typecheck + tests -> manual browser flow -> Pull Request -> review -> merge.

## 6. Install shadcn and free dashboard block (M1)

```powershell
npx shadcn@latest init
npx shadcn@latest add dashboard-01
```

Read the component files and verify where the block was installed (`src/` vs root). Apply this on an isolated branch and **do not overwrite** protected route logic, API handlers or backend modules. First make it visually render using demo data; then replace cards/charts/table demo JSON with server-selected real data. Control animations: use free prebuilt components when available; GSAP only for transitions that materially improve UX.

For GSAP:

```powershell
npm install gsap
```

Run it in Client Components (effects/GSAP context and cleanup), do not animate server-rendered data before hydration, and honor reduced-motion preferences. Add free Magic UI or Aceternity components **only after** checking each component's license/dependencies; do not import paywalled code.

## 7. Validate the feature in a browser (M3)
1. Logged out -> open `/dashboard` -> redirected to sign-in.
2. Signed-in non-admin -> denied; direct Server Action/Route Handler invocation still denied.
3. Admin -> create category; duplicate category refused.
4. Add product; negative stock invalid; duplicate SKU blocked; unknown category blocked.
5. Filter/search; page 2 consistent; hard refresh retains data.
6. Archive product -> active counts and table update; restore -> appears again.
7. Keyboard-only forms, 375px mobile, dark/light mode, reduced motion.
8. Inspect browser Network tab: no leaked `DATABASE_URL`, no stack traces, expected HTTP responses.

See `04_TESTING_PLAYBOOK.md` and `11_TESTING_HANDS_ON_LAB.md` for guided test exercises, failures and fixes.

## 8. CI/CD and deployment (M4)
Add `typecheck` (`tsc --noEmit`) and `test` (`vitest run`) scripts to `package.json`, commit lockfile, then use `starter/.github/workflows/ci.yml`. The workflow needs **Prisma Client generation** before typecheck/build. CI build may use a dummy syntactically valid connection string; it should not query production DB or run migrations. Never expose production Neon credentials to untrusted PR jobs.

Deploy via Vercel Git integration. Configure `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` for each environment. `BETTER_AUTH_URL` must match the deployed canonical origin. Vercel deployment alone does not guarantee migrations ran; apply reviewed migrations via `npx prisma migrate deploy` in a trusted, authorized environment before depending on new schema. Build a dedicated staging DB before automating migrations in production. Document a rollback for code and separately plan DB forward-fixes.

**Smoke after release:** login -> admin check -> create/edit/archive on **test/seed data only** -> verify dashboard stats -> no unexpected 500s -> mobile layout -> logout. Tag a release `v0.1.0` once accepted; add release notes and known limitations.

## 9. Exact order of commands — compact reference
```powershell
# 1. New app and repository
npx create-next-app@latest controldesk --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd controldesk
# 2. Dependencies
npm install @prisma/client@7 @prisma/adapter-pg pg dotenv zod better-auth @better-auth/prisma-adapter
npm install -D prisma@7 tsx @types/pg vitest @playwright/test
# 3. Prisma (only once)
npx prisma init --datasource-provider postgresql --output ../src/generated/prisma
# 4. Apply starter files, create .env, then:
npx prisma generate
npx prisma migrate dev --name catalog-baseline
# 5. Better Auth: generate schema + migrate
npx auth@latest generate
npx prisma migrate dev --name add-auth
npx prisma generate
# 6. Local server
npm run dev
# 7. Checks (once package scripts added)
npm run lint
npm run typecheck
npm run test
npm run build
```

Commands are **staged**, not all pasted at once. If command output differs, read errors and compare installed version to official docs; never mechanically re-run destructive commands.

## 10. What to write in a developer diary
For each issue record: goal, predicted flow, five failure cases, what code changed, which tests ran, screenshots, bugs fixed, one thing learned, one remaining question. This produces evidence for interviews and helps you reproduce decisions without ChatGPT.
