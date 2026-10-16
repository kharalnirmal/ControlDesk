# Engineering Fundamentals — Learn Before You Copy Code

This is a **learning path**, not a dictionary to memorize. For each topic: (1) explain the problem without framework vocabulary, (2) draw a flow, (3) predict failure cases, (4) implement, (5) test, (6) record the insight. Suggested self-test questions appear at the end of each section.

## 1. What is a backend, really?
The browser is an **untrusted client**. A backend exists to enforce rules and mediate access to shared state and external systems. Someone can edit browser requests, bypass your UI, and call a Server Action directly. Therefore: a disabled Delete button is *not* security. Business rules and authorization must run on the server, close to the protected operation.

**Request mental model:** client produces request -> routing chooses handler -> session resolves identity -> authorization checks whether that identity may perform the operation -> validation checks shape/value -> business rule decides whether operation is legal -> database transaction persists -> handler returns structured success/error -> client updates. The order of authentication and validation details varies, but no protected DB mutation should skip authorization.

**Practice:** draw the lifecycle for a product creation request; identify three places it can fail. Explain why no amount of frontend validation prevents a crafted invalid request.

## 2. Node.js / HTTP / Next.js boundaries
Node.js executes JavaScript/TypeScript on the server. HTTP is a transport protocol built around request methods, headers, bodies, status codes and response payloads. A REST API exposes resources through URLs and methods. Neither REST nor Node.js requires Python. In Next.js, a Server Component can query the database directly *on the server*; it should not request your own Route Handler merely to reach Prisma. Server Actions are special network-callable functions and must be treated as endpoints, including session and permission checks.

Understand: GET reads; POST creates or initiates an action; PATCH partially updates; DELETE removes (or archives, if defined). Response examples: `200` success, `201` created, `400` malformed request, `401` unauthenticated, `403` lacks permission, `404` missing resource, `409` conflict, `422` invalid field values, `429` too many requests, `500` unexpected server failure. Do not leak stack traces or database passwords to the browser. HTTP 200 does not mean that an application mutation is semantically correct; validate outcome and business constraints.

**Request example:** `POST /api/products` with `{name, sku, price, stock, categoryId}`. Questions: Who can call it? What if SKU already exists? What if category was deleted a millisecond ago? What if the network times out after insertion?

**Practice:** write a request and its potential success/error responses on paper. Explain why `POST` is not inherently idempotent.

## 3. Authentication vs authorization
**Authentication:** is this session associated with a real signed-in account? **Authorization:** is this account permitted to perform this action on this object? Broken Object Level Authorization (BOLA) occurs when someone can access a resource they should not access. Broken Function Level Authorization (BFLA) occurs when users can call privileged operations that they should not execute. Sequential IDs vs UUIDs/cuids affect guessability; they never replace permission checks. Core authorization tenets: **deny by default, least privilege, enforce server-side on each request and each resource, audit important decisions**.

For V0.1 a record in `AdminAccess` grants admin privileges; merely being logged in is insufficient. Better Auth owns password hashing and session issuing. Turn off public signup for production and verify that the disable flag blocks direct API calls too. In later roles, model permission per action (`product:read`, `product:write`, `order:fulfill`).

**Practice:** sign up a second non-admin user in local dev and test a protected mutation. It must be rejected even if the user constructs a direct request. Never trust a `role` submitted by the browser.

## 4. Input validation: type systems cannot secure HTTP
TypeScript describes *what your program assumes* during compilation. Runtime inputs arrive as strings, JSON and FormData, which can be malicious or malformed. Zod validates shape and semantics at runtime. Distinguish user mistakes (report clearly) from DB failures (log privately and return generic failure). Never render untrusted URLs as executable code; whitelist URL protocols and trusted image domains where appropriate. Never interpolate raw user strings into SQL; use parameterized Prisma queries.

Layered integrity: UI validation provides quick feedback; **server validation** establishes the trust boundary; DB constraints protect concurrent writes and race conditions. Example: Zod checks SKU format; unique DB index guards simultaneous duplicate creation.

**Practice:** list seven invalid product inputs (blank name, negative stock, `NaN`, huge price, unknown category, duplicate SKU, unsafe URL). Determine which layer rejects each.

## 5. Business logic and transaction thinking
A service/use-case should answer: **what operation must stay correct regardless of the UI?** A controller/Server Action is the interface adapter, not the home of complex rules. A repository/data-access module is useful where persistence logic is reused or complex; do not create empty classes just to imitate an architecture diagram.

An inventory decrement and an order record are one logical unit: either both succeed, or neither should become visible as complete. DB transactions implement atomicity. For competing orders, use conditional updates/checks inside a transaction (not `read stock -> check -> write stock` without concurrency protection). Think in invariants: `stock >= 0`, `sku unique`, `category exists`, and “shipped orders cannot magically revert to draft.”

**Practice:** two buyers each purchase the last item. Explain the lost-update problem and how an atomic conditional update prevents overselling.

## 6. Databases: tables, relationships, constraints
A table stores entities; a foreign key preserves relationships; unique constraints preserve invariants; an index speeds a particular query at a cost to writes and storage. Normalization keeps facts in appropriate places. Category to Product is one-to-many: `Product.categoryId` is the foreign key and `Product.category` is the ORM navigation relationship. A `findMany` call is not automatically fast; inspect SQL and query plans when data grows.

Prisma schema `@@index([categoryId])` helps queries filtering by category, but does **not** implement Google-like full-text ranking. PostgreSQL supports trigram/full-text indexes later; begin with bounded search and measure before adding Elasticsearch. Database migrations are version-controlled transformations of schema. `migrate dev` is for development; `migrate deploy` applies committed migrations in release environments. Never reset production DB to fix a migration conflict.

Money uses decimal type and a declared currency. “Inventory value” at retail price is not cash, profit or revenue. Avoid JavaScript floating point for financial calculations.

**Practice:** explain what happens if category deletion is attempted while products reference it. Predict how a unique index handles concurrent SKU creation.

## 7. Next.js rendering and caching
A Server Component runs server-side and can access server-only modules; a Client Component supports browser state, event handlers and effects. `'use client'` is a boundary that increases client-side JavaScript. Reserve it for interactive UI. A Server Action sends a mutation to the server; never assume it executes in a trusted local browser context. After writes, invalidate relevant cached/route data; `revalidatePath` or refresh may be appropriate depending on data flow.

Distinguish (a) database freshness, (b) cache invalidation and (c) React client state. A chart showing old data may result from any one of the three. Avoid global cache for personalized authz data without understanding cache keys and leakage risks.

**Practice:** trace why newly added product is missing from a list: DB insert, selection filter, route revalidation, browser cache, optimistic state.

## 8. Performance: first measure, then optimize
Common bottlenecks: unbounded database reads, N+1 relations, rendering thousands of rows, large JavaScript bundles, eager chart libs, sequential external calls, and costly animations on low-end devices. Start with pagination, select only required columns, indexes matched to query predicates, and fetch in parallel only where safe. Use Lighthouse/browser performance tools plus DB EXPLAIN to collect evidence. Instrument before claiming a speed improvement.

GSAP is not required for every hover. Prefer CSS transform/opacity and `prefers-reduced-motion`. Don't animate layout-heavy properties unnecessarily. Chart libraries already handle many transitions.

## 9. API design contract
Public APIs are interfaces that require consistent inputs/outputs, status codes and authorization checks. For internal app-only mutations, Server Actions are often simpler than building a redundant REST layer. Route Handlers remain valuable for webhooks and external consumers. Example optional REST routes:

| Action | Endpoint | Permissions | Expected errors |
|---|---|---|---|
| Read products | GET `/api/v1/products?page=1&q=...` | admin | 401,403,400 |
| Read one | GET `/api/v1/products/:id` | admin | 401,403,404 |
| Create | POST `/api/v1/products` | admin | 401,403,422,409 |
| Update | PATCH `/api/v1/products/:id` | admin | 401,403,404,409,422 |
| Archive | POST `/api/v1/products/:id/archive` | admin | 401,403,404,409 |

If exposing APIs later: use a stable version, documented pagination, consistent errors, request body limits, resource-level permissions and rate limiting; do not simultaneously maintain two divergent sets of business rules.

## 10. DevOps principles
A build turns source into an artifact; CI ensures changes pass automated checks; CD ships validated artifacts into an environment; operations monitors and recovers the running service. `git push` alone is not a deployment strategy. Environments: local development, preview/staging and production have different URLs, credentials, data and safety expectations.

**CI:** reproducible install from lockfile, Prisma generation, lint, type check, unit tests, build. **CD:** deployment after authorized merge/approval, database migration with proper permissions, smoke test, alerts. Secrets belong in the environment/secret manager, not code or screenshots. Maintain a tested rollback procedure; rolling back application code does not automatically roll back DB changes.

**Practice:** write the steps to recover from a bad deploy without deleting the production database.

## 11. How to use AI without losing independence
Use AI for: asking why, reviewing a PR diff, proposing failure cases, debugging a specific error. Do not ask it to silently design the entire system, generate 50 components, and declare completion. Ask one question at a time: “What invariant does this function enforce?”, “Which edge case did I miss?”, “Can you review my test?” When AI creates UI, give concrete reference screenshots, tokens, interaction rules, and a component inventory; iterate a small area, not the whole site. After the explanation, close the answer and re-implement from memory.

## 12. Study sequence for each milestone
1. Read requirement + source-of-truth.
2. Draw inputs, outputs, trust boundary and data flow.
3. Write invariants and **five failure cases**.
4. Design schema/indexes/transaction needs.
5. Define tests **before** adding implementation.
6. Write small slice; run tests; inspect behavior in browser/devtools.
7. Explain the code in your own words and record a three-paragraph retrospective.
8. Commit and open a PR. Do not skip the explanation step.

**Self-evaluation (0-3 each):** explain from first principles, implement without copying, debug failure, test, review/communicate. Score below 2 means repeat with a smaller example. Mastery is demonstrated by independent reasoning, not number of completed tutorials.
