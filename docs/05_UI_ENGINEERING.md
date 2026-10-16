# UI & Frontend Engineering — Hybrid SaaS Without Paid Kits

For the implementation-ready page/component inventory, tokens, animation rules, states and quality gates, continue with `12_UI_IMPLEMENTATION_SPEC.md`.

The visual goal is **premium and usable**, not maximum animation. Treat consistency as a system, not 30 disconnected components copied from different libraries.

## 1. Our design direction
- **Structure:** left desktop sidebar, compact mobile nav, clear page title/actions, responsive content width, dense but breathable tables.
- **Colors:** restrained neutral surfaces with one accent color; state colors have semantic meaning (error, warning, success). Dark mode is a first-class theme, not inverted white.
- **Typography:** deliberate hierarchy; 12-14px support copy, 14-16px UI copy, larger page titles/KPIs; legible figures with tabular numbers.
- **Spacing/radius:** pick a small consistent scale (4/8/12/16/24/32px), comfortable card radius, consistent border/shadow treatment.
- **States:** skeletons, empty illustration/content, permission denied, form invalid, saving/loading, success, retryable failures, archive confirmation, disabled/busy.
- **Accessibility:** semantic headings, keyboard support, focus ring, ARIA where needed, label/input association, contrast, reduced motion.

## 2. Component selection policy
Use the **free shadcn dashboard-01** as a known visual baseline. Do not assume every Aceternity or Magic UI snippet is free; verify individually. If a desired component is paywalled, replace the *design behavior*, not proprietary code, with an eligible free alternative. Never randomly import a giant library for one animation. Use TanStack Table for table logic, Recharts/shadcn charts for actual visualization. Use copied source only with appropriate license and attribution requirements.

### Where to use GSAP
**Yes:** a short entrance stagger for summary cards, a small slide-and-fade for route/page panels when that improves orientation, a one-time count animation. **No:** animations on every table row during pagination, constantly moving KPI cards, transitions that block typing/clicking, effects on weak mobile devices. Implement cleanup (`gsap.context(...).revert()`), avoid layout shift, and respect `prefers-reduced-motion`. Prefer CSS for hover/focus.

## 3. Layout and screen architecture
**Dashboard:** greeting/title, relevant period information, KPI grid (Products, Categories, Low Stock, Out of Stock), category/stock chart from DB, latest products section. No fake revenue.

**Products:** title + create button, filter/search panel, status/category filter, table with `SKU/Name/Category/Price/Stock/Status/Updated`, sort and pagination, row actions (edit/archive/restore), detail form and accessible confirmation. Category dropdown data should come from DB, not hardcoded.

**Categories:** list with product counts; add/rename; delete only if unused; accessible duplicate error.

**Auth:** simple trustworthy sign-in with focus/error handling. Development signup is for bootstrap only and disabled for production.

**Settings:** profile/theme preferences only in v0.1; company/user team settings later.

## 4. Design QA checklist
- At 375px, 768px, and 1440px: no horizontal overflow, table still usable, sidebar operable.
- Keyboard: Tab order logical, visible focus, Escape closes dialogs, Enter submits properly.
- Forms: real labels, field descriptions, disabled submit during pending, clear error output, no double submission.
- Data: loading skeleton is not confused with empty dataset; success/error states available; numeric units/currency identified (choose configurable NPR initially, but display actual business currency).
- Motion: disabled or simplified under reduced-motion preference, no element blocking critical interactions.
- Dark mode: status colors and chart tooltips readable, contrast checked.
- Actual data: component placeholders removed before marking feature “done.”

## 5. AI-assisted visual iteration without endless rewrites
Give the coding assistant **one component** plus a screenshot, references, constraints and concrete acceptance criteria. Example: “Modify the KPI row only. Keep shadcn structure, 4 metrics in a responsive grid, use neutral dark/light surfaces, no gradient background, animate number once with reduced-motion support. Do not change navigation, database query or CSS tokens outside this module.” Then compare screenshot and diff. Do not ask for “make whole dashboard more modern.”

## 6. Design log template
For any new screen record: reference URL/screenshot, user task, key components, responsive behavior, states, motion rules, dependencies/licenses, acceptance tests. Keep screenshots in `docs/assets/` only after verifying permissions and avoiding confidential data.

### References
- Free dashboard block: https://ui.shadcn.com/blocks
- Component docs: https://ui.shadcn.com/docs
- GSAP docs: https://gsap.com/docs/v3/
- WCAG: https://www.w3.org/WAI/standards-guidelines/wcag/
