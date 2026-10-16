# Diagnostics, Production Runbook & Common Mistakes

## The troubleshooting ladder
**1. Identify the exact failing layer** (browser/UI, Server Action, auth/session, validation, Prisma/SQL, CI, deployment). **2. Reproduce** with the smallest input. **3. Read the first meaningful error and stack frame. 4. Form one hypothesis. 5. Change one thing. 6. Rerun the minimal test. 7. Document the root cause.** Do not copy-paste random fixes from different major-version tutorials.

## Quick command toolkit
```powershell
node -v
npm -v
npm ls next react prisma @prisma/client @prisma/adapter-pg better-auth
npx prisma validate
npx prisma generate
npx prisma migrate status
npm run lint
npm run typecheck
npm run test
npm run build
git status
git log --oneline -5
```

## Environment and authentication
- **`DATABASE_URL` missing** -> confirm `.env` root path, restart dev server; never hardcode secrets.
- **Prisma driver adapter error** -> Prisma 7 requires `PrismaPg` passed into `new PrismaClient({adapter})`.
- **Generated Prisma import missing** -> confirm schema generator output and `npx prisma generate`; do not import `@prisma/client` directly if custom generated path is configured.
- **Better Auth `auth generate` fails** -> check `auth.ts` import path and that baseline Prisma Client exists; align Better Auth package/docs versions.
- **Signed in but 403** -> Better Auth session exists but `AdminAccess` was not provisioned for this `userId` (desired security behavior).
- **Login works locally but not deployed** -> inspect `BETTER_AUTH_URL`, secret, trusted origin/cookies, HTTPS, configured DB and deployment logs.
- **Unexpected production signup works** -> blocker; set `disableSignUp` at Better Auth server config, redeploy, verify direct HTTP API rejects it.

## Prisma migrations
- `prisma migrate dev` is a development tool. `prisma migrate deploy` applies committed migrations to release DB.
- If migration wants to **reset database**, STOP. Never accept reset on production or the only valuable dataset.
- After schema changes, run `prisma generate` and commit migration SQL. Compare schema migration history across environments.
- Prisma model `stock Int` **does not automatically enforce `stock >= 0`**. Add explicit DB CHECK constraints in migration SQL for stock/price (see starter SQL), on top of Zod.
- `P2002`: unique conflict such as SKU/category; `P2003`: foreign key constraint. Provide friendly message and log technical diagnostic server-side.

## Next.js render/data issues
- A server component cannot use browser hooks unless moved to `'use client'` child.
- Server-only secret access must never move into a Client Component.
- Mutation succeeded but list old: inspect `revalidatePath`, query filters, cached route/data and actual DB record.
- Strange build behavior: dynamic routes are required when reading per-user cookies/headers, but don't globally disable caching without understanding why.
- `dashboard-01` install overwrote routes: restore file from Git, inspect installed files, re-apply protected layout/page gate. Prefer a dedicated feature branch.

## CI and deployments
- `npm ci` fails: check `package-lock.json` is committed and synchronized.
- Type errors after generated schema: wrong Prisma output/import; re-run generator.
- CI build needs env: use only a syntactically valid fake URL for build if needed; do not expose production secret to PR CI.
- Vercel points to old commit: verify Git branch, integration, new deployment record, ignored build settings, then manually redeploy as diagnostic. It is not necessarily application caching.
- Deployed code references missing table: migration not applied. Never run schema reset.
- DB connections exhausted: use singleton Prisma Client and review pooled vs direct Neon connections.
- Chart is blank: check data shape, string vs numeric conversion, container size, zero-data state, domain and time periods.

## Incident response (future production operation)
1. Confirm scope/severity; stop unsafe releases.
2. Capture logs, affected deployment commit, approximate start time and failing routes **without leaking secrets**.
3. Reproduce on staging or safe test data.
4. Decide rollback (code) vs forward fix; schema rollback requires special caution.
5. Restore function; verify authentication and data integrity; monitor.
6. Write short incident report (timeline, impact, root cause, mitigation, prevention tests).

## Backup/restore
Neon may offer branch/backups subject to account/plan. Never assume a vendor backup exists until verified. For mature releases, schedule **restoration exercises** on isolated data. Store no DB dumps with sensitive information in the Git repository.

## Version-change procedure
Read official release notes for Next/Prisma/Better Auth before upgrading majors. Make a branch `chore/dependency-upgrade`, run unit/integration/E2E suites and migration checks, update lockfile, deploy to staging, confirm cookies/session handling. Avoid “latest everything” after app stabilizes.

## Known starter limitations
The bundle is a learning-oriented starter **overlay**. It is not fully installed; npm cannot fetch packages in the document-generation container and DB credentials are intentionally absent. The sample implements limited core vertical slices, not complete v0.1. It contains examples to adapt rather than a guaranteed complete production system. CI, isolated DB integration suite, full E2E and external deployment need setup. See `starter/README.md`.
