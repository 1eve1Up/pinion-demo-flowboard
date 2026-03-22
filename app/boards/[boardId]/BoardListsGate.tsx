"use client";

import dynamic from "next/dynamic";

import type { BoardDetailDTO } from "@/lib/serialize";

const BoardListsView = dynamic(
  () =>
    import("./BoardListsView").then((mod) => ({ default: mod.BoardListsView })),
  {
    ssr: false,
    loading: () => (
      <div
        className="mt-8 flex gap-4 overflow-x-auto pb-2"
        role="status"
        aria-label="Loading board columns"
      >
        <div className="h-48 w-72 shrink-0 animate-pulse rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900/80" />
        <div className="h-48 w-72 shrink-0 animate-pulse rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900/80" />
      </div>
    ),
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
