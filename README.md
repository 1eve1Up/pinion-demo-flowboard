This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Repository layout

- **This directory** (repository root) — FlowBoard app (`package.json`, `app/`, `public/`). Run all npm scripts here.
- **`pinion/`** — Pinion coordination tooling only (not application code). Pinion CLI: `cd pinion && ./bin/pinion …`.

## Getting Started

Prerequisites: **Node.js** (LTS recommended).

From the **repository root**, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Database (SQLite / Prisma)

FlowBoard uses **Prisma** with **SQLite** for local development (empty DB is fine; migrations create tables).

From the **repository root**:

```bash
cp .env.example .env
npm install
npm run db:migrate
npm run db:smoke
```

- **`npm run db:migrate`** — applies migrations from `prisma/migrations/` (`prisma migrate deploy`). Safe on a **fresh, empty** database.
- **`npm run db:migrate:dev`** — create or update migrations during development (`prisma migrate dev`).
- **`npm run db:smoke`** — runs **`prisma migrate deploy`** on **`DATABASE_URL`** (default `file:./prisma/dev.db`), then inserts a board, list, and card and verifies the hierarchy (PIN-002 proof). Safe right after **`npm test`**, which only migrates the separate test DB.

Schema: **Board** → **List** → **Card**, each with **`position`** on list and card for ordering.

## REST API (JSON)

Base path: **`/api`** (App Router route handlers). Errors use **`{ "error": "..." }`** with **4xx** status codes.

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
| `PATCH` | `/api/cards/[cardId]` | Body `{ "title"?, "description"?, "listId"?, "position"? }` — **`listId`** only if the target list is on the **same board** |
| `DELETE` | `/api/cards/[cardId]` | |

Run **`npm test`** for automated API coverage (uses `prisma/test-integration.db`).

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
