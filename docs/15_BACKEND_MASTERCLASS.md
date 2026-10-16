# Backend Masterclass — First Principles Before Framework Syntax

**Aim:** Build transferable mental models. You are learning backend engineering through Next.js, not memorizing Next.js. Every concept applies broadly to Express, Fastify, Java, Go, and other stacks.

## 1. What a server does

A browser asks a question or requests a change; a server receives bytes over a network, interprets a protocol, authenticates a caller, enforces rules, reads/writes state, and returns an outcome. The server is a **trust boundary**: incoming content can be malformed or malicious. Node.js is the JavaScript runtime executing server code; Next.js supplies routing, rendering and server entry points.

Typical flow:

```text
Browser → HTTP request / Server Action POST
       → Router determines handler
       → Parse and validate untrusted input
       → Verify identity (session)
       → Authorize operation and resource
       → Execute business rules / transaction
       → Database query via Prisma
       → Serialize allowed result or safe error
       → Invalidate/re-render affected UI
```

**First-principles question:** Who owns authority to decide if the operation is allowed? **The server**, not a client button or TypeScript type.

## 2. HTTP and REST without Express

The web is a request-response system. Request: method, URL, headers (cookies/auth), optional body. Response: status, headers, body. A REST resource can be a product; common methods:

| Method | Path | Semantics | Typical result |
|---|---|---|---|
| GET | `/api/products` | retrieve list, safe/idempotent | 200 |
| POST | `/api/products` | create resource | 201 or 422/409 |
| GET | `/api/products/{id}` | retrieve individual record | 200 or 404 |
| PATCH | `/api/products/{id}` | partially update | 200/204, 422/403/404 |
| DELETE | `/api/products/{id}` | delete/archive by contract | 204 or 403/404 |

An API contract defines *who can call, payload shape, outcomes and errors*. In our single Next.js app, **Server Actions** are often the right server boundary for admin form mutations, whereas **Route Handlers** expose explicit HTTP endpoints (webhooks, external clients, health checks). Neither is inherently secure; every server entry point requires its own access check.

**Status codes:** 400 malformed request; 401 not authenticated; 403 authenticated but forbidden; 404 missing/not disclosed; 409 conflict; 422 invalid business input; 429 rate limited; 500 unexpected server failure. A Server Action may expose a structured state instead of a raw HTTP JSON response; don't confuse UI state with the underlying authorization rule.

## 3. Authentication vs authorization vs validation

- Authentication (**AuthN**) asks **who are you?** Better Auth creates/verifies session cookies using server-side configuration.
- Authorization (**AuthZ**) asks **may you perform this action on this object?** `AdminAccess` helps initially. Later staff roles and object ownership need explicit rules.
- Validation asks **is the submitted data allowed and well formed?** Zod and DB constraints are complementary.

For `createProduct`, check the server session and admin grant *before* performing the mutation. A valid session does not imply admin authorization; a valid `categoryId` string does not prove that category exists. Client-side validation is just UX; users can bypass it.

**Threat examples:** Changing product ID in a request to access a different item (BOLA); calling an admin-only action as Staff (BFLA); sending a negative stock through devtools; reusing an old session after permission revocation. Translate every scenario into a test.

## 4. SQL and Prisma mental models

PostgreSQL stores tables, rows, columns, indexes and constraints. Prisma helps express typed queries, but **SQL semantics still determine behavior**. Example:

```ts
const products = await prisma.product.findMany({
  where: { archivedAt: null, stock: { lte: 5 } },
  orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  take: 10,
});
```

This is conceptually `SELECT ... WHERE archived_at IS NULL AND stock <= 5 ORDER BY created_at DESC, id DESC LIMIT 10`. Learn to ask about indexes and query plans rather than assuming an ORM is fast by default. `@unique` enforces a DB uniqueness invariant; a UI pre-check alone has a race condition.

**Relation cardinality:** one category has many products; each product has one category. `categoryId` is an FK scalar, while `category` is the Prisma relation field. A foreign-key constraint prevents a product referencing an unrecognized category. `onDelete: Restrict` prevents accidental orphaning if implemented in DB.

**Indexes:** accelerate certain reads but cost storage and write work. Add according to filters/sorts actually used; inspect PostgreSQL `EXPLAIN (ANALYZE)` on representative data before blindly adding indexes.

## 5. Money, time, IDs, and data integrity

- Prices: exact decimal in Postgres, validate decimal strings, never use imprecise JavaScript floating point for financial sums. In v0.1 catalog prices are display metadata; real checkout/payment intentionally absent.
- Timestamps: store `createdAt`, `updatedAt`, `archivedAt`; decide timezone rendering at UI. Never rely on browser time for authorization/business deadlines.
- IDs: opaque IDs/UUIDs reduce guessability but **do not replace authorization**. Guessing a UUID can still be possible; server must check permission.
- Null vs missing vs empty string are distinct states. Define what each means in an input schema.
- Database constraints are your final guard when concurrent requests bypass a preliminary read.

## 6. Transactions and concurrency

A transaction groups operations so they commit together or fail together. Suppose a customer orders 1 item and stock is 1; two staff members confirm simultaneously:

```text
Bad implementation:
Request A reads stock=1    Request B reads stock=1
A sees sufficient           B sees sufficient
A subtracts 1               B subtracts 1
Both "succeed" → oversell/lost update
```

**Better pattern (conceptual):** In a transaction, update with `WHERE stock >= requested`, decrement atomically, and verify exactly one row was affected; otherwise reject and roll back the transaction. If an order has multiple lines, all decrements and order state change must succeed together. Database isolation levels and retry behavior matter for advanced cases; test actual concurrent requests against a real test DB.

**Idempotency:** if a request is retried after timeout, should the operation happen twice? Product creation may reject duplicate SKU; an order confirmation must not decrement inventory twice. Use an idempotency key/unique transition control when appropriate. React pending UI prevents double clicks visually but is not a server guarantee.

## 7. Server Components and Server Actions in Next.js

- Server Component: renders on server; can query DB privately; never embed credentials in Client Components.
- Client Component: interactive UI, local state, browser-only APIs, GSAP animations; still receives safe serialized data from server.
- Server Action: server function invoked via mutation; should validate, authenticate and authorize on each call.
- Route Handler: explicit HTTP API function useful for REST or webhooks; must protect each operation too.
- `revalidatePath`: signals that cached/rendered data associated with path should refresh according to Next.js semantics; it **does not** perform security or transaction handling.

**Ask before caching:** Could stale data expose incorrect stock counts, permission changes or outdated order state? What freshness is acceptable? Choose caching consciously; invalidation cannot fix incorrect database writes.

## 8. Error handling and observability

Expected errors (invalid SKU, missing category, duplicate) should become safe, understandable feedback. Unexpected errors should be logged with enough context to diagnose but **not** leaked into UI. Use request IDs, action names, actor IDs where appropriate, duration and outcome. Never log secrets, password values, raw tokens or full personal data. Return a correlation ID to users for support only when logging/lookup exists.

Define service boundaries when they improve clarity: a catalog service may coordinate validation and persistence. Don't invent controllers/services/repositories for a single trivial query just to imitate enterprise layers; add them when business logic is shared or hard to test.

## 9. Security and deployment basics

- Environment configuration should separate dev, test, preview and production; never use production DB for Playwright tests.
- HTTPS, cookies, same-site rules, CSRF protection, safe redirects and correct origin settings matter for auth. Use library guidance and test direct endpoints.
- Dependency updates can change behavior; maintain lockfile, review advisories and upgrade deliberately.
- Migrations change shared state. Test on staging, deploy in planned order, and avoid destructive schema changes without a data migration/backup strategy.
- Rate limiting, abuse prevention, monitoring, backups and disaster recovery are **production-hardening tasks**, not automatic by installing Next.js.
- Avoid fake analytics and generic “success” responses when underlying writes fail.

## 10. A learning loop for every feature

1. **State invariants:** what must always be true? (`stock >= 0`, unique SKU, non-admin forbidden).
2. **Draw flow:** caller → boundary → identity → authorization → validation → business rule → DB → response.
3. **Design contracts:** input, actor, outcomes, errors, idempotency, side effects.
4. **Predict failure cases:** nonexistent ID, wrong permissions, concurrent updates, DB outage.
5. **Write a pure test:** validation/transition logic before UI.
6. **Implement a thin vertical slice:** actual input → real persistence → visible result.
7. **Add integration/browser tests:** prove critical boundaries.
8. **Ship through PR and CI:** document evidence and decision.
9. **Reflect:** could you explain it to another developer without seeing code?

## 11. Interview-grade self-check questions

- Why does a Server Component query not expose your DB password to the browser?
- What's the difference between a logged-in user and an authorized admin?
- Why do client-side form checks not prevent unauthorized writes?
- Why does `@unique` matter when Zod already checks SKU format?
- How can two orders both pass a stock check without a transaction?
- Why can a completed deployment still fail at runtime?
- Which tests show that the app is safe to release, and what remains untested?
- When would you choose a Route Handler over a Server Action?
- What happens if you roll back Next.js code but not a destructive migration?
- What evidence would convince a reviewer that `M3 — Catalog` is complete?

If you cannot answer, return to the relevant lab; that is learning progress, not failure.
