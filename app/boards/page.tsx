import Link from "next/link";

import { prisma } from "@/lib/prisma";

import { createBoard } from "./actions";

type SearchParams = Promise<{ error?: string }>;

export default async function BoardsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error } = await searchParams;
  const boards = await prisma.board.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <header className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Boards</h1>
        <Link
          href="/"
          className="text-sm text-zinc-500 underline-offset-4 hover:text-zinc-800 hover:underline dark:hover:text-zinc-200"
        >
          Home
        </Link>
      </header>

      {error === "missing-title" ? (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert">
          Add a board title before creating.
        </p>
      ) : null}

      <form
        action={createBoard}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">New board</span>
          <input
            name="title"
            type="text"
            required
            placeholder="e.g. Sprint backlog"
            autoComplete="off"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Create
        </button>
      </form>

      <section className="mt-10" aria-labelledby="board-list-heading">
        <h2 id="board-list-heading" className="sr-only">
          Your boards
        </h2>
        {boards.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-zinc-600 dark:border-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-400">
            No boards yet. Name one above and hit Create.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-700 dark:border-zinc-700">
            {boards.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/boards/${b.id}`}
                  className="block px-4 py-3 text-zinc-900 hover:bg-zinc-50 dark:text-zinc-50 dark:hover:bg-zinc-900"
                >
                  <span className="font-medium">{b.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
