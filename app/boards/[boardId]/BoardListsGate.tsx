"use client";

import dynamic from "next/dynamic";

import type { BoardDetailDTO } from "@/lib/serialize";

/** Static placeholder columns — matches BoardListsView shell width/layout (no @dnd-kit). */
function BoardListsSkeleton() {
  const columns = [0, 1, 2];
  return (
    <div
      className="mt-8 flex gap-4 overflow-x-auto pb-2"
      role="status"
      aria-busy="true"
      aria-label="Loading board columns"
    >
      {columns.map((i) => (
        <div
          key={i}
          className="flex w-72 shrink-0 flex-col rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50"
        >
          <div className="flex items-center gap-2 border-b border-zinc-200 px-2 py-2 dark:border-zinc-700">
            <div className="h-6 w-6 shrink-0 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 min-w-0 flex-1 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
          <div className="flex min-h-[11rem] flex-1 flex-col gap-1 px-2 py-2">
            <div className="h-9 animate-pulse rounded border border-zinc-200/80 bg-white dark:border-zinc-700 dark:bg-zinc-950" />
            <div className="h-9 w-[92%] animate-pulse rounded border border-zinc-200/80 bg-white dark:border-zinc-700 dark:bg-zinc-950" />
            <div className="h-9 animate-pulse rounded border border-zinc-200/80 bg-white dark:border-zinc-700 dark:bg-zinc-950" />
            <div className="mt-auto space-y-1.5 border-t border-zinc-200 pt-2 dark:border-zinc-700">
              <div className="h-8 animate-pulse rounded-md bg-zinc-200/90 dark:bg-zinc-800" />
              <div className="h-7 animate-pulse rounded-md bg-zinc-300/80 dark:bg-zinc-700" />
            </div>
          </div>
        </div>
      ))}
      <div className="w-72 shrink-0 rounded-lg border border-dashed border-zinc-300 bg-white p-3 dark:border-zinc-600 dark:bg-zinc-950">
        <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-3 h-9 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
        <div className="mt-2 h-8 w-24 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

const BoardListsView = dynamic(
  () =>
    import("./BoardListsView").then((mod) => ({ default: mod.BoardListsView })),
  {
    ssr: false,
    loading: () => <BoardListsSkeleton />,
  },
);

export function BoardListsGate({
  board,
  includeArchived,
}: {
  board: BoardDetailDTO;
  includeArchived: boolean;
}) {
  return <BoardListsView board={board} includeArchived={includeArchived} />;
}
