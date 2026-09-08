# Agent guidance (this repository)

See also pinion/AGENTS.md

## Where code lives

- **FlowBoard (application)** — Implement at **this directory** (repository root): `package.json`, `app/`, `public/`, Next.js config, and future API/database code. Run `npm run dev`, `npm run build`, and app tests from here.
- **Pinion (coordination only)** — The `pinion/` subtree is the Pinion tooling and its `.pinion/` state. Do **not** put FlowBoard application code, `package.json` for the app, or app `node_modules` inside `pinion/`. From repo root, Pinion CLI: `cd pinion && ./bin/pinion …`.

For Pinion workflows, commands, and Python tooling details, see **[pinion/AGENTS.md](pinion/AGENTS.md)**.

## FlowBoard app proof (dual gate)

Pinion **`pinion transition … review`** runs **`pytest`** under **`pinion/tests/`** only. FlowBoard proof lives at the **repository root**:

- **`npm test`** — Vitest API/integration tests (includes migrations via `pretest`)
- **`npm run build`** — `prisma generate` + `next build`

Before **`pinion transition … review`** on any FlowBoard PIN, run **both** commands from the repo root and treat them as **hard proof**, even when Pinion pytest already passes. Work-unit `validation` may name these commands; transitions do not execute them automatically.

## FlowBoard board page: `@dnd-kit` and SSR

On **`/boards/[boardId]`**, sortable columns and cards live in **`BoardListsView`**, which is loaded only through **`BoardListsGate`** ([`app/boards/[boardId]/BoardListsGate.tsx`](app/boards/[boardId]/BoardListsGate.tsx)). That gate uses **`next/dynamic`** with **`ssr: false`** so **`@dnd-kit`** is not server-rendered (avoids hydration mismatches and broken sortables).

**Keep it that way:** do not mount **`BoardListsView`** (or other **`@dnd-kit`** sortable trees) directly from the server **`page.tsx`**. New drag-and-drop work should stay under the same client-only boundary. Note: **`export const dynamic = "force-dynamic"`** on the page is about routing/data freshness, not component SSR; it does not replace the need for **`ssr: false`** on the sortable UI.

## Board UI conventions (sprint-4 / sprint-5 / sprint-6)

- **Loading** — **`BoardListsGate`** uses **`next/dynamic`** with a **`loading`** UI (**`BoardListsSkeleton`**) that mirrors column width and layout. It is static markup only; do **not** mount **`@dnd-kit`** in the skeleton.
- **DnD errors** — **`BoardListsView`** surfaces a single red banner with **`role="alert"`** when column reorder, in-list card reorder, or cross-list card move requests fail (HTTP or network). Prefer **[`readApiErrorMessage`](lib/read-api-error.ts)** to turn **`{ "error": "..." }`** responses into copy. Failed column reorder restores prior list order; failed card moves call **`router.refresh()`** to match the server. Do not swallow these errors silently.
- **Due date chips** — Card-face due labels and urgency tones come from **`cardDueMeta`** in **[`lib/card-due-meta.ts`](lib/card-due-meta.ts)** (covered by **`tests/card-due-meta.test.ts`**). Keep behavior and tests in sync if you change date rules.
- **Label chips / filters** — Card-face label chips and board filter query parsing live with board data (`labels` on board/card DTOs; **[`lib/board-filters.ts`](lib/board-filters.ts)**). Filter chrome (**`BoardFilters`**) stays outside sortable internals; keep new board-canvas overlays under **`BoardListsGate`**.
- **Card details** — The expanded **Details** block is an inline **`role="dialog"`** with **`aria-modal="false"`**, **`Escape`** closes it, and focus returns to the **Details** control. Label assign checkboxes and the **comments** list/compose UI live in this panel. Comments fetch **`GET /api/cards/[cardId]/comments`** on open (board GET does not nest threads by default). Keep this inside the same client gate as sortables unless you deliberately redesign SSR and focus.

## Pinion prompt shortcuts

- "pinrev": review and then recommend the highest value sprint number that follows. For speed work: choose by effect on realistic end-to-end automation, not by whichever hop the previous sprint’s profiler left named.
- "pinsprint XXX": run `pinion/bin/pinion set-active-sprint sprint-XXX`; draft sprint-XXX.md and skip pinion style details.
- "pinplan": "pinion plan-sprint": which means follow the spec and create work units, etc.
- "pingo": "pinion go", which means implement the code changes, and then run pinion's branch-merge strategy, for each of the planned PIN's in this sprint. be sure to create a new feature branch for each PIN. do not skip tests.
- "pintro": pinion retro and actually complete the retrospective; then draft a blog post for the completed sprint under docs/.