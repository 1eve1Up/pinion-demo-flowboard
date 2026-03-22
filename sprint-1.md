# Sprint 1

## 1. Sprint Goal

Ship a **single-user, no-auth** vertical slice of FlowBoard: a user can create a board, add lists and cards, and **move a card between lists** with persistence across refresh. The app lives at the **repository root** (sibling to `pinion/`); Pinion coordination stays under `pinion/`.

## 2. In-Scope Chains

- **Stack bootstrap** — Next.js (App Router) + TypeScript + Tailwind at repo root; documented dev command.
- **Persistence** — Board → List → Card schema with ordered positions; migrations reproducible on empty DB.
- **HTTP API** — Boards, lists, cards, and **card move** (update `list_id` / `position`) aligned with PRD shapes where applicable.
- **UI** — Board picker/create, board columns, list + card CRUD, drag-and-drop between lists calling the API.
- **Quality** — Automated tests on the sprint path; production build passes.

**Deferred (not this sprint)**

- Authentication, workspaces, roles, real-time/WebSockets, attachments, comments, labels, search, notifications, list/column reorder (beyond card move), multi-user collaboration.

## 3. Deferred Work

- OAuth/email auth, workspace invites, permissions matrix, activity log, performance SLO hardening, PostgreSQL in production (SQLite acceptable for sprint), S3, Jira sync for app code.

## 4. Critical Path

`PIN-001` → `PIN-002` → `PIN-003` → `PIN-004` → `PIN-005` → `PIN-006` → `PIN-007` → `PIN-008` → `PIN-009` → `PIN-010`

Scaffold and data/API must exist before UI; DnD depends on cards UI; tests and build harden after the feature path works.

## 5. Root Targets

- **PIN-001** — Bootstrap FlowBoard app (Next.js + TS + Tailwind) at repository root with documented `npm run dev`.

## 6. Risks

- **Scope creep** — PRD MVP includes auth; this sprint **explicitly** defers it. Watch for tasks sneaking in OAuth or workspaces.
- **DnD + persistence** — Race between optimistic UI and API failures; keep proof focused on refresh-survives persistence first.
- **Split repo layout** — App at root vs `pinion/` docs; executors should run `pinion build` from `pinion/` and app scripts from root.

## 7. Owner-Class Summary

All ten targets use **`owner_class: default`** (matches `agents.owner_classes.allowed` in `.pinion/config.yaml`). No split by agent type in this sprint.

---

## Targets (reference)

| ID | Target (summary) | Depends on |
| --- | --- | --- |
| PIN-001 | Scaffold Next.js + TS + Tailwind at repo root | — |
| PIN-002 | DB schema + migrations for board/list/card | PIN-001 |
| PIN-003 | REST API for boards, lists, cards, move | PIN-002 |
| PIN-004 | UI: list/create boards, navigate to board | PIN-003 |
| PIN-005 | UI: board columns, create lists | PIN-004 |
| PIN-006 | UI: create/edit cards in columns | PIN-005 |
| PIN-007 | Drag-and-drop card between lists + persist | PIN-006 |
| PIN-008 | Automated tests for sprint happy path | PIN-007 |
| PIN-009 | `npm run build` (and lint if configured) passes | PIN-008 |
| PIN-010 | README: setup, env, scripts, sprint limitations | PIN-009 |

## Retrospective

### Meta

- **Date / time**: 2026-03-22 (closed `00:12:53Z`)
- **PINs**: PIN-001 through PIN-010 (all **released**)
- **Scope**: sprint-1 wrap — FlowBoard vertical slice


### What happened

We **shipped the sprint goal**: FlowBoard at the **repository root** with Prisma/SQLite, REST API for boards/lists/cards (including same-board **move**), UI for board index and board columns, **@dnd-kit** cross-list drag with persistence, **Vitest** API regression on the sprint path, **ESLint** wired to lint the tree, and a **README** that documents clean checkout, env, and explicit **sprint-1 limitations** (no auth). All ten pins were completed in order and released; **`pinion retro`** closed **sprint-1** and cleared **`active_sprint`**.

### Actions

- [ ] **Sprint-2 planning** — Set **`project.active_sprint`** when ready; pull next outcomes from [Sample-PRD.md](../../../Sample-PRD.md) (e.g. auth, Postgres, or continued hardening)—explicitly **out of scope** for sprint-1 per plan.

### Notes

**Delivered vs PRD:** Full **single-user** slice matches sprint boundaries; **auth, workspaces, realtime**, and **multi-user** collaboration remain **deferred**, as documented in the root README. **Next:** optional sprint-2 for deferred items or production hardening; re-run **`pinion build`** after changing **`active_sprint`**.
