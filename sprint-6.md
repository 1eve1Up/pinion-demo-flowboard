# name: Sprint 6 card comments
overview: "Plan Sprint 6 with theme **card comments**: add append-only comments on cards in Prisma + REST (optional author string, no User), surface a thin list + compose UI in the existing card Details panel, and document the dual app proof gate from sprint-5 retro—keeping auth, realtime, Postgres, mentions, notifications, and board activity log out of scope."

# Sprint 6: Card comments

## Grounding in sprint-5

**Shipped (sprint-5):** Board-scoped **Label** / **CardLabel** schema and migration, label DTOs, label CRUD and card attach/detach APIs, **GET** board filters (`label` / `due` / `keyword` with `includeArchived`), label chips on cards, board Labels manager + Details assign UI, URL-synced filter controls, Vitest coverage, and README / AGENTS label/filter conventions.

**Deferred (unchanged; stay out of this sprint):** OAuth/email auth, `User`, invites, roles, enforcement, **activity log**, realtime/presence, PRD-scale attachments/notifications/search, assignees, PostgreSQL/S3/sync, full workspace membership, comment **mentions**, threading/editing.

**Surfaces to extend:** Prisma `Card` under `prisma/schema.prisma`, DTO mappers in `lib/serialize.ts`, `app/api/cards/[cardId]/`, and the card **Details** block in `[BoardListsView.tsx](app/boards/[boardId]/BoardListsView.tsx)`. **Constraint:** keep `@dnd-kit` and new board-canvas overlays inside `[BoardListsGate](app/boards/[boardId]/BoardListsGate.tsx)` / `ssr: false` per [AGENTS.md](AGENTS.md). Comments UI stays in the existing Details dialog (same client gate as label assign).

**Process carry-forward (sprint-5 retro):** Before `pinion transition … review` on FlowBoard PINs, always run **`npm test`** and **`npm run build`** from the repository root; document the dual gate in AGENTS.md (PIN-051). 

---

## 1. Sprint goal

Make cards **annotatable by humans and agents**—append-only comments end-to-end (schema → API → thin Details UI) with an optional **`author`** string and no login—so automation can log run output, blockers, and handoffs without overwriting card **description**.

---

## 2. In-scope chains

| Chain | Targets | Intent |
| --- | --- | --- |
| **Schema** | PIN-046 | `Comment` on `Card` (`text`, optional `author`, `createdAt`); SQLite migration. |
| **DTOs** | PIN-047 | Serialize comments on card payloads; camelCase JSON; stable sort (oldest first). |
| **Comment API** | PIN-048 | `GET`/`POST` `/api/cards/[cardId]/comments`; optional `DELETE` for demo cleanup. |
| **Details UI** | PIN-049 | Comment list + compose in card Details; fetch on open to keep board GET lean. |
| **Regression guard** | PIN-050 | Vitest for create/list ordering, validation, 404/400 edges. |
| **Docs + proof gate** | PIN-051 | README API table; AGENTS dual-gate + comment/Details conventions if needed. |

---

## 3. Deferred work

Same as prior sprints: authentication, multi-user isolation, permission enforcement, realtime, Postgres cutover, **board activity/audit log**, attachments, notifications, assignees, PRD-scale search, workspace membership. No `@mentions`, no edit history, no threaded replies, no rich text—plain text only.

---

## 4. Critical path

PIN-046 → PIN-047 → PIN-048 → PIN-049 → PIN-050 → PIN-051

Schema and DTOs before HTTP; comment API before Details UI; tests and docs last.

---

## 5. Root targets

- **PIN-046** — Prisma: `Comment` model on `Card`, with a reproducible SQLite migration.

---

## 6. Risks

| Risk | Mitigation |
| --- | --- |
| **Scope creep into collaboration product** | Append-only text; no mentions, reactions, or edit threads. |
| **Board GET payload bloat** | Do not nest full comment threads on `GET /api/boards/[boardId]` by default; Details fetches `/api/cards/[cardId]/comments` on open. |
| **Details panel crowding** | Reuse sprint-4/5 Details layout; comments section below description/labels; keep compose to one field + optional author. |
| **Split-repo proof (again)** | PIN-051 documents root **`npm test`** + **`npm run build`** as mandatory before FlowBoard review transitions. |

---

## 7. Owner-class summary

All sprint-6 targets use **`owner_class: default`**.

---

## Explicitly out of scope

Authentication, multi-user isolation, permission enforcement, realtime, Postgres cutover, board activity log, attachments, notifications, assignees, comment mentions/editing/threading, workspace membership semantics.

---

## Optional (if capacity allows)

Comment count badge on card face; `loading.tsx` polish; include last N comments on nested card DTOs for agents that prefer one board GET.

---

## Targets (reference)

| ID | Target (summary) | Depends on |
| --- | --- | --- |
| PIN-046 | Prisma Comment on Card; SQLite migration | — |
| PIN-047 | Serialize comment DTOs on card payloads | PIN-046 |
| PIN-048 | REST GET/POST `/api/cards/[cardId]/comments` | PIN-047 |
| PIN-049 | Comments list + compose in Details UI | PIN-048 |
| PIN-050 | Vitest for comments API | PIN-049 |
| PIN-051 | README + AGENTS dual-gate and comment conventions | PIN-050 |

## Retrospective

### Meta

- **Date / time**: 2026-09-08
- **Scope**: sprint-6 wrap

### Stats

- **PB-1 artifact bundle:** `pinion/pinion/sprints/artifacts/sprint-6/` (under the Pinion tree)

- **Lines added** (sum): 565
- **Net lines** (sum): 555
- **Estimated input tokens** (sum): 943
- **Files changed** (sprint envelope): 10

### What happened

All six planned targets (**PIN-046**–**PIN-051**) shipped: **`Comment`** schema and migration, comment DTOs, **GET**/**POST** (and **DELETE**) comment APIs, Details-panel list + compose UI (fetch on open), Vitest coverage, and README / **AGENTS.md** updates including the **dual app proof gate** from sprint-5 retro. Scope stayed **no-auth / no-realtime**; agents can now annotate cards without overwriting **description**.

### 5 whys

_Focus: Why did the first `pinion transition … review` fail during sprint-6 execution (pytest import errors for `jsonschema` / `yaml`)?_

1. **Why did review transition fail?** `pinion transition PIN-046 review` runs **`pytest`** and it exited with collection errors.
2. **Why did pytest fail to collect?** `./bin/pinion` invokes **system `python3`**, which did not have Pinion’s test dependencies installed.
3. **Why wasn’t the venv used automatically?** The CLI wrapper is `#!/usr/bin/env python3` with no `.venv` activation or shebang preference.
4. **Why did sprint-5 merges not surface this here?** Prior runs may have had deps on PATH or a pre-warmed environment; sprint-6 exposed the gap when executing transitions from a clean shell.
5. **Why?** **Root cause:** **Pinion proof assumes a prepared Python env** — transitions do not bootstrap or require `pinion/.venv/bin` on **`PATH`**; executors must activate the venv (or install deps) before review, similar to the FlowBoard dual gate.

### Actions

- [x] Document FlowBoard **`npm test`** + **`npm run build`** as mandatory before review (**PIN-051** / **AGENTS.md** dual gate).
- [ ] Document (or automate) running Pinion transitions with **`pinion/.venv/bin` on `PATH`** — or teach **`bin/pinion`** to prefer the repo venv when present.
- [ ] Next sprint candidates: **board activity/audit log** (still no `User`), optional comment count on card face, or **auth + agent token** if multi-user demo scope opens.

### Notes

- **Good patterns to carry forward:** API-first comments before Details UI; **fetch comments on panel open** keeps board GET lean; **`toCommentDTOs`** oldest-first; FK cleanup order **`comment → cardLabel → label → …`**; six-PIN sprint stayed focused vs sprint-5’s ten.
- **Sprint-5 retro closed:** dual app proof gate is now documented, not just an open action item.
- Blog post: **[docs/sprint-6-card-comments.md](docs/sprint-6-card-comments.md)**.
