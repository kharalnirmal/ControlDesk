# UI Implementation Specification — A Premium Free-Component ControlDesk

**Design choice locked:** **C: Hybrid SaaS**. Think polished operations software: clear hierarchy, restrained movement, very high legibility and elegant density. We will **reuse legitimately free, inspectable component code** rather than reinventing advanced visuals or copying paid packs. This is a **design contract**, not a screenshot of a finished app.

## 1. The central strategy: one visual foundation

Use **shadcn/ui `dashboard-01`** as the starting shell (sidebar, cards, chart, data table). Official site and install: https://ui.shadcn.com/blocks?category=dashboard ; command `npx shadcn@latest add dashboard-01` **after** running `npx shadcn@latest init`. It is a starting example with demo data. Our app is not done until we replace all placeholders with real queries and reapply admin guards.

Why one foundation? Different UI libraries have different tokens, spacings, radii, fonts, focus behavior and animation conventions; mixing whole layouts causes an incoherent UI. **shadcn/ui owns the functional shell**, and Magic UI / Aceternity are optional accents, not an alternative app architecture.

### Our component sourcing policy

| Requirement | Primary choice | Optional secondary source | Special rule |
|---|---|---|---|
| Sidebar and shell | shadcn `dashboard-01` | none | preserve auth gate |
| Table, filters, pagination | shadcn + TanStack Table | none | **server-side** filtering/sorting/pagination for large data |
| Forms | shadcn inputs/selects/dialogs | none | Zod validation still server-side |
| KPI cards | shadcn section cards | Magic UI number ticker | disabled for reduced motion |
| Category / stock charts | shadcn chart + Recharts | none | real DB aggregation, zero fabricated revenue |
| Notifications | shadcn toast/Sonner | none | human-readable error and undo if appropriate |
| Tooltips / drawers / tabs | shadcn | none | keyboard and screen reader controls |
| Rich transitions | CSS first; GSAP selectively | Magic UI/Aceternity | inspect license + bundle impact |
| Icons | Lucide React | none | consistent stroke size |

**Licenses:** Check *each component's current license* and attribution terms before copying. Don't copy paid/premium source code. Record source URL and date in `docs/08_RISK_DECISIONS.md` or a `docs/COMPONENT_SOURCES.md` file. Official providers: https://ui.shadcn.com/ ; https://magicui.design/ ; https://ui.aceternity.com/ ; https://gsap.com/ . Avoid more than one competing UI foundation.

## 2. Visual design tokens (initial defaults, adjustable once)

- **Density:** professional data-focused. Cards may be compact but not cramped. Main content target max width ~1440px, sidebar ~240–260px expanded, icon/collapsed state as supported.
- **Spacing:** 4px base scale; page horizontal padding 16px mobile, 24–32px desktop; cards ~16–24px interior padding.
- **Radius:** input `0.5rem` / card `0.75–1rem` depending on chosen block; use CSS theme variables, not bespoke radii on each page.
- **Typography:** one clean sans-serif (default Next Geist or selected installed font); use typography scale consistently. H1 ~24–30px, table labels ~13–14px, secondary copy muted but readable.
- **Palette:** neutral light/dark surfaces with **one restrained accent** (recommend slate/blue or neutral/teal). Status colors convey meaning only: green success, amber warning, red destructive/error. No rainbow KPI colors.
- **Charts:** line/area for trends, bar for category distribution, simple labels and readable axes; sparing tooltips. No chart with misleading truncated baselines without good reason.
- **Accessibility:** visible focus ring, label associated with inputs, semantic tables, tab order, keyboard sidebar/menu, accessible dialogs, minimum reasonable touch targets, AA-like contrast goal.
- **Responsiveness:** 375px mobile, 768px tablet, 1280px desktop, 1600px large. On mobile, replace large tables with horizontal overflow or row cards deliberately; don't silently hide critical columns.
- **Data format:** use NPR `Rs.`/`NPR` consistently for price examples, actual values from DB; date/time localized when designed. Don't mix fictional dollars with Nepal-local examples.

### Suggested page skeleton

```text
+--------------------------------------------------------------+
| Sidebar | Breadcrumb / page title          Search   Theme User|
|         |----------------------------------------------------|
| Overview|  KPI cards (active products, categories, low stock) |
| Products|  ------------------------------------------------  |
| Category|  Inventory category chart / activity or alerts     |
| Settings|  ------------------------------------------------  |
|         |  Recent products / issue indicators                 |
+--------------------------------------------------------------+
```

Design must look good with **0 records**, **few records**, **many records**, **loading**, and **error** data, not only with curated demo JSON.

## 3. Screens and visual acceptance criteria

### `/sign-in`
- Brand identity, clear concise title, labeled email/password, show/hide password if supported, pending state, non-leaking error message, keyboard focus, small-screen fit.
- No need for abstract giant hero backgrounds or long motion sequences.

### `/dashboard`
- Summary row with **actual** active products, category count, low/out-of-stock counts, stock units; no revenue/sales before Order exists.
- One category/stock visualization backed by a real Prisma aggregate/query. Consider chart empty state and very long category names.
- Alerts for low stock, with link to filtered Products view. Recent activity only once audit schema exists; otherwise clearly marked planned/omitted.

### `/dashboard/products`
- Search, filter, sort and bounded pagination. Loading/empty/error feedback, keyboard-usable row actions.
- Create/Edit in a side sheet or dialog only if accessible and manageable; otherwise full page forms are fine. Validate on client for immediate guidance **and again on server**.
- Archive requires clear confirmation. Success returns focus/feedback and refreshes table counts; failure doesn't silently discard user's input.

### `/dashboard/categories`
- Name, product count, actions. Duplicate names give useful message. Deletion cannot orphan products; decide restrict/archive policy before implementation.

### `/dashboard/settings`
- Account information, theme and security UI; do not advertise account controls that don't work yet. Hide disabled placeholders or label “planned,” never fake functionality.

## 4. Component implementation sequence

1. Open the official dashboard demo and pick **one** layout you actually like. Save reference screenshots for both themes and mobile.
2. Scaffold clean Next app and verify auth/database foundation on a branch separately. Commit working functionality before introducing new dashboard markup.
3. Create `feat/ui-shell` branch; install shadcn init and `dashboard-01`. Inspect what files get created or overwritten **before staging** (`git status`, `git diff`). Preserve auth boundary.
4. Remove demo `data.json` usage *one component at a time*. Feed `SectionCards` real serializable server-selected values. Then replace chart demo with real aggregate. Then wire `DataTable` with query parameters and backend pagination.
5. Centralize theme variables and choose light/dark palette in **one place**. Build component patterns for empty/loading/error, not random per-page Tailwind fragments.
6. Introduce GSAP only when the static UI is stable: page entrance, counter animation, menu transition if library doesn't already handle it. Cleanup GSAP contexts on unmount; respect `prefers-reduced-motion`, don't break SSR/hydration.
7. Run responsive/keyboard/contrast review and capture before/after screenshots. Open PR with **visual evidence**.

### GSAP acceptance policy

- Animations convey transition, not hide missing backend behavior.
- No large pinned scrolling, heavy WebGL/canvas or constant motion in admin tables.
- Ensure cleanup; use React-friendly lifecycle patterns and reduced motion. Use CSS transitions for small hover changes.
- Prefer **0–300ms** functional microinteractions; avoid making users wait for KPI changes.
- Test `prefers-reduced-motion: reduce` and low-end/mobile responsiveness.

## 5. Design review checklist (put this in UI PR)

- [ ] Screenshot: desktop light theme.
- [ ] Screenshot: desktop dark theme.
- [ ] Screenshot: mobile 375px.
- [ ] Page has clear title, main action, breadcrumbs/location.
- [ ] Design tokens consistent across pages.
- [ ] Focus indicator visible on every interactive item.
- [ ] Error/empty/loading states are intentional.
- [ ] Mock numbers removed from production-visible screens.
- [ ] Actions map to working backend behavior.
- [ ] No overflow/overlap at mobile widths.
- [ ] Reduced-motion option honored.
- [ ] No premium/unlicensed components added.
- [ ] No unnecessary libraries added just for cosmetic effect.

## 6. Prompt template for working with an AI coding assistant

> We are implementing ControlDesk, a Next.js App Router/TypeScript full-stack admin panel. Our source of truth is `docs/00_SOURCE_OF_TRUTH.md`; the UI contract is `docs/12_UI_IMPLEMENTATION_SPEC.md`. **Use the installed shadcn `dashboard-01` structure and existing components**, not a new lookalike UI. Only use free/open-source components after validating their license. Preserve authorization and server-side database logic. Work on one page at a time. First inspect existing files, describe proposed file changes and any required dependencies; then implement a minimal diff. Include loading/empty/error states, responsive light/dark behavior, reduced motion, and tests. Do not invent analytics data or claim production readiness without verification. Include how to test locally.

This solves endless AI iteration better than vague prompts like “make it beautiful.” Reference a **specific component and layout**, impose **consistency constraints**, and evaluate each page against a checklist.

## 7. Official reference bookmarks

- shadcn dashboard block: https://ui.shadcn.com/blocks?category=dashboard
- shadcn chart: https://ui.shadcn.com/docs/components/chart
- TanStack Table: https://tanstack.com/table/latest
- GSAP: https://gsap.com/docs/v3/
- Web Content Accessibility Guidelines: https://www.w3.org/WAI/standards-guidelines/wcag/
