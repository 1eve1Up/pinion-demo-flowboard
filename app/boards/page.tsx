import Link from "next/link";

import { prisma } from "@/lib/prisma";

import { createBoard, createWorkspace } from "./actions";

type SearchParams = Promise<{
  error?: string;
  workspaceId?: string;
}>;

const inputClass =
  "rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const secondaryButtonClass =
  "rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const primaryButtonClass =
  "rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-[color,background-color] hover:bg-foreground/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export default async function BoardsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error, workspaceId: workspaceIdParam } = await searchParams;

  const workspaces = await prisma.workspace.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      boards: { orderBy: { createdAt: "asc" } },
    },
  });

  const selectedWorkspaceId =
    (workspaceIdParam &&
    workspaces.some((w) => w.id === workspaceIdParam)
      ? workspaceIdParam
      : null) ??
    workspaces[0]?.id ??
    null;

  const selected = workspaces.find((w) => w.id === selectedWorkspaceId);
  const boards = selected?.boards ?? [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            FlowBoard
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance">
            Boards
          </h1>
          <p className="mt-2 max-w-xl text-pretty text-muted-foreground">
            Pick a workspace, then open or create boards inside it.
          </p>
        </div>
        <Link
          href="/"
          className="shrink-0 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Home
        </Link>
      </header>

      {error === "missing-title" ? (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert">
          Add a board title before creating.
        </p>
      ) : null}
      {error === "missing-workspace" ? (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert">
          That workspace no longer exists. Pick another workspace and try again.
        </p>
      ) : null}

      <section
        className="mb-8 rounded-xl border border-border bg-muted/25 p-5"
        aria-labelledby="workspace-heading"
      >
        <div className="flex flex-col gap-1">
          <h2
            id="workspace-heading"
            className="text-sm font-semibold text-foreground"
          >
            Workspace
          </h2>
          <p className="text-sm text-muted-foreground">
            All boards live inside one workspace. Switch workspace to see a
            different set of boards.
          </p>
        </div>
        {workspaces.length === 0 ? (
          <p className="mt-4 text-sm text-pretty text-muted-foreground">
            You don&apos;t have a workspace yet. Add a name below to get
            started—then you can create your first board.
          </p>
        ) : (
          <ul className="mt-4 space-y-1.5" role="list">
            {workspaces.map((w) => {
              const active = w.id === selectedWorkspaceId;
              return (
                <li key={w.id}>
                  <Link
                    href={`/boards?workspaceId=${encodeURIComponent(w.id)}`}
                    className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                      active
                        ? "bg-foreground font-medium text-background"
                        : "text-foreground hover:bg-muted/80"
                    }`}
                  >
                    <span className="min-w-0 truncate">{w.name}</span>
                    <span
                      className={`shrink-0 tabular-nums ${
                        active
                          ? "text-background/80"
                          : "font-normal text-muted-foreground"
                      }`}
                    >
                      {w.boards.length} board{w.boards.length === 1 ? "" : "s"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <form
          action={createWorkspace}
          className="mt-5 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-end"
        >
          <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">New workspace</span>
            <span className="sr-only">Workspace name</span>
            <input
              name="name"
              type="text"
              placeholder="e.g. Personal"
              autoComplete="off"
              className={inputClass}
            />
          </label>
          <button type="submit" className={secondaryButtonClass}>
            Add workspace
          </button>
        </form>
      </section>

      {selectedWorkspaceId ? (
        <section aria-labelledby="new-board-heading" className="space-y-3">
          <h2 id="new-board-heading" className="text-sm font-semibold text-foreground">
            New board
          </h2>
          <form
            action={createBoard}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <input type="hidden" name="workspaceId" value={selectedWorkspaceId} />
            <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm">
              <span className="text-muted-foreground">In {selected?.name}</span>
              <span className="sr-only">Board title</span>
              <input
                name="title"
                type="text"
                required
                placeholder="e.g. Sprint backlog"
                autoComplete="off"
                className={inputClass}
              />
            </label>
            <button type="submit" className={primaryButtonClass}>
              Create board
            </button>
          </form>
        </section>
      ) : null}

      <section
        className="mt-12 border-t border-border pt-10"
        aria-labelledby="board-list-heading"
      >
        <h2
          id="board-list-heading"
          className="text-sm font-semibold text-foreground"
        >
          Boards in this workspace
        </h2>
        {!selectedWorkspaceId ? (
          <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/15 px-5 py-10 text-center">
            <p className="mx-auto max-w-sm text-pretty text-sm text-muted-foreground">
              Create a workspace above first. After that, you&apos;ll name and
              create boards here.
            </p>
          </div>
        ) : boards.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/15 px-5 py-10 text-center">
            <p className="mx-auto max-w-sm text-pretty text-sm text-muted-foreground">
              No boards in <span className="font-medium text-foreground">{selected?.name}</span> yet.
              Add a title in <span className="font-medium text-foreground">New board</span> and
              choose <span className="font-medium text-foreground">Create board</span>.
            </p>
          </div>
        ) : (
          <ul
            className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border"
            role="list"
          >
            {boards.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/boards/${b.id}`}
                  className="block px-4 py-3.5 text-foreground transition-colors hover:bg-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
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
