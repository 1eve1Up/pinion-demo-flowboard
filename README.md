# FlowBoard

FlowBoard is a **sprint-1 demo**: kanban-style **boards**, **lists**, and **cards** with drag-and-drop between lists, backed by **Prisma** + **SQLite** and a **Next.js** (App Router) UI and REST API.

## Repository layout

- **Repository root** — FlowBoard app (`package.json`, `app/`, `lib/`, `prisma/`, `tests/`). Run **`npm install`**, **`npm run dev`**, **`npm test`**, and **`npm run build`** here.
- **`pinion/`** — Pinion coordination only (task graph, work units, generated views). It is **not** part of the shipped app. Contributors updating Pinion state should run **`cd pinion && ./bin/pinion build`** to refresh the graph and views; command details and agent-oriented notes live in **[pinion/AGENTS.md](pinion/AGENTS.md)**.

## Sprint-1 scope and limitations

This release is intentionally **single-user** and **local-first**:

- **No authentication** — there is no login, OAuth, sessions, or per-user data isolation. Anyone who can reach the app sees the same SQLite database.
- **No workspaces or multi-tenant accounts** — boards are not scoped to organizations or teams.
- **No realtime collaboration** — no websockets or live presence; concurrent edits are not coordinated.

**Deferred (not in sprint-1):** proper **auth** (e.g. OAuth or email/password), **workspaces** / shared teams, and **realtime** multi-user updates. The README does **not** claim these ship in sprint-1.

## Quick start (new contributors)

**Prerequisites:** Node.js (LTS recommended).

### Tests and production build

From the **repository root** (no `.env` required for this path):

```bash
npm install
npm run lint
npm test
npm run build
```

`npm test` runs migrations against `prisma/test-integration.db` (see `pretest` in `package.json`) and executes Vitest API tests. `npm run build` runs `prisma generate` and `next build`.

### Run the app locally

```bash
npm install
# Optional: copy .env.example → .env if you want an explicit DATABASE_URL file
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **`/boards`** for the board index and **`/boards/[id]`** for a board (create a board from the UI or via `POST /api/boards`).

### Environment

- **`DATABASE_URL`** — Optional. If unset, the app defaults to `file:./prisma/dev.db` (see `lib/prisma.ts`). Use [`.env.example`](.env.example) as a template. For production, set `DATABASE_URL` in the host environment.

## Database (SQLite / Prisma)

FlowBoard uses **SQLite** via Prisma. An empty database is fine; migrations create tables.

```bash
npm run db:migrate       # prisma migrate deploy — safe on a fresh DB
npm run db:migrate:dev   # prisma migrate dev — when changing the schema
npm run db:smoke         # migrate + insert sample board/list/card (PIN-002 smoke)
```

Schema: **Board** → **List** → **Card**, with **`position`** on lists and cards for ordering.

## REST API (JSON)

Base path: **`/api`**. Errors use **`{ "error": "..." }`** with **4xx** where appropriate.

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/boards` | List boards (`id`, `title`, `createdAt`) |
| `POST` | `/api/boards` | Body `{ "title" }` |
| `GET` | `/api/boards/[boardId]` | Board with nested lists → cards (ordered by `position`) |
| `DELETE` | `/api/boards/[boardId]` | Cascades lists and cards |
| `POST` | `/api/lists` | Body `{ "boardId", "title", "position"? }` |
| `PATCH` | `/api/lists/[listId]` | Body `{ "title"?, "position"? }` |
| `DELETE` | `/api/lists/[listId]` | |
| `POST` | `/api/cards` | Body `{ "listId", "title", "description"?, "position"? }` |
| `PATCH` | `/api/cards/[cardId]` | Body `{ "title"?, "description"?, "listId"?, "position"? }` — `listId` only if the target list is on the **same board** |
| `DELETE` | `/api/cards/[cardId]` | |

Run **`npm test`** for automated API coverage (sprint-path regression included).

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [Prisma documentation](https://www.prisma.io/docs)

## Deploy

Deploy like any Next.js app (e.g. [Vercel](https://vercel.com/)); set **`DATABASE_URL`** to a database your host supports (this repo defaults to SQLite for local sprint-1 work).
