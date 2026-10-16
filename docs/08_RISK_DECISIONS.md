# Architecture Decision Records (ADRs) & Risks

## ADR-001 Single Next.js application
**Decision:** Next.js App Router modular monolith, not Next.js + Express service. **Context:** developer knows the basic Next ecosystem and wants deep first-principles learning within a constrained build window. **Trade-off:** avoids extra deployments/CORS/auth sharing; still requires server trust boundaries and proper use-case design. **Revisit if:** external API clients or independent scaling genuinely require separation.

## ADR-002 Prebuilt free UI
**Decision:** start from open-source shadcn dashboard-01; add selectively licensed free Magic UI/Aceternity components; use GSAP only for necessary motion. **Trade-off:** less time spent authoring every UI element, more time on accessible integration and business logic. **Revisit if:** dependency/size/license issues or design quality problems emerge.

## ADR-003 Prisma 7 + Neon
**Decision:** Prisma 7 with PostgreSQL driver adapter and migrations in version control. **Risk:** major version mismatch, missing generated output, connection pooling/migration URL issues. **Mitigation:** pinned lockfile, official docs, separate migrations and runtime credentials as necessary.

## ADR-004 Admin authorization separated from sessions
**Decision:** `AdminAccess` keyed by Better Auth user ID. **Reason:** signing in does not confer administrative privilege; prevents automatic admin access to any newly registered account. **Risk:** manual bootstrap overhead; acceptable for single-admin v0.1. **Future:** team RBAC in v0.2 with migration plan.

## ADR-005 Real metrics only
**Decision:** only actual DB-backed catalog/stock KPIs in v0.1. **Reason:** avoid false business claims and testable data inconsistency. **Future:** revenue only after order/payment concepts are rigorously defined.

## ADR-006 Testing before production claims
**Decision:** CI minimum lint, typecheck, unit and build; v0.1 release additionally requires manual smoke and relevant E2E/integration evidence, production protection checks, and migrations. **Risk:** 2–3 day timeline may slip. **Resolution:** ship smaller scope rather than skip critical security tests.

## Open decisions to log before implementation
- UI accent color and typography references: choose during M1, document screenshots/licenses.
- Business currency: default demonstration `NPR`; actual production currency must be configured and displayed consistently.
- Product image strategy: HTTPS image URL in MVP; upload/storage later with URL validation and safe host policy.
- Production domain and test DB isolation; configure only after resources are available.
- Search indexes: begin with bounded Prisma `contains`, measure after scale test and then decide PostgreSQL full-text/trigram.

## Dependency and cost risks
Free service tiers can change. Do not design critical operations assuming unlimited usage. Some component sites mix free and paid code; verify every imported component’s license. No paid platform dependency is required by the baseline. Keep current package versions recorded in the repo and official references in source of truth.
