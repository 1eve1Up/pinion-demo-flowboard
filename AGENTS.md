# Agent guidance (this repository)

## Where code lives

- **FlowBoard (application)** — Implement at **this directory** (repository root): `package.json`, `app/`, `public/`, Next.js config, and future API/database code. Run `npm run dev`, `npm run build`, and app tests from here.
- **Pinion (coordination only)** — The `pinion/` subtree is the Pinion tooling and its `.pinion/` state. Do **not** put FlowBoard application code, `package.json` for the app, or app `node_modules` inside `pinion/`. From repo root, Pinion CLI: `cd pinion && ./bin/pinion …`.

For Pinion workflows, commands, and Python tooling details, see **[pinion/AGENTS.md](pinion/AGENTS.md)**.

## FlowBoard board page: `@dnd-kit` and SSR

On **`/boards/[boardId]`**, sortable columns and cards live in **`BoardListsView`**, which is loaded only through **`BoardListsGate`** ([`app/boards/[boardId]/BoardListsGate.tsx`](app/boards/[boardId]/BoardListsGate.tsx)). That gate uses **`next/dynamic`** with **`ssr: false`** so **`@dnd-kit`** is not server-rendered (avoids hydration mismatches and broken sortables).

**Keep it that way:** do not mount **`BoardListsView`** (or other **`@dnd-kit`** sortable trees) directly from the server **`page.tsx`**. New drag-and-drop work should stay under the same client-only boundary. Note: **`export const dynamic = "force-dynamic"`** on the page is about routing/data freshness, not component SSR; it does not replace the need for **`ssr: false`** on the sortable UI.

## Board UI conventions (sprint-4)

- **Loading** — **`BoardListsGate`** uses **`next/dynamic`** with a **`loading`** UI (**`BoardListsSkeleton`**) that mirrors column width and layout. It is static markup only; do **not** mount **`@dnd-kit`** in the skeleton.
- **DnD errors** — **`BoardListsView`** surfaces a single red banner with **`role="alert"`** when column reorder, in-list card reorder, or cross-list card move requests fail (HTTP or network). Prefer **[`readApiErrorMessage`](lib/read-api-error.ts)** to turn **`{ "error": "..." }`** responses into copy. Failed column reorder restores prior list order; failed card moves call **`router.refresh()`** to match the server. Do not swallow these errors silently.
- **Due date chips** — Card-face due labels and urgency tones come from **`cardDueMeta`** in **[`lib/card-due-meta.ts`](lib/card-due-meta.ts)** (covered by **`tests/card-due-meta.test.ts`**). Keep behavior and tests in sync if you change date rules.
- **Card details** — The expanded **Details** block is an inline **`role="dialog"`** with **`aria-modal="false"`**, **`Escape`** closes it, and focus returns to the **Details** control. Keep this inside the same client gate as sortables unless you deliberately redesign SSR and focus.
