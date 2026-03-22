import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchBoardDetailFromApi } from "@/lib/fetch-board-api";

import { BoardListsGate } from "./BoardListsGate";
import { BoardMetaEditor } from "./BoardMetaEditor";

export const dynamic = "force-dynamic";

type Params = Promise<{ boardId: string }>;

export default async function BoardDetailPage({
  params,
}: {
  params: Params;
}) {
  const { boardId } = await params;
  const board = await fetchBoardDetailFromApi(boardId);

  if (!board) {
    notFound();
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-[120rem]">
        <nav className="mb-6">
          <Link
            href="/boards"
            className="text-sm text-zinc-500 underline-offset-4 hover:text-zinc-800 hover:underline dark:hover:text-zinc-200"
          >
            ← Boards
          </Link>
        </nav>
        <header className="mb-2">
          <h1 className="text-3xl font-semibold tracking-tight">{board.title}</h1>
          <BoardMetaEditor
            boardId={board.id}
            initialDescription={board.description}
            initialVisibility={board.visibility}
          />
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Lists load from the API (ordered by{" "}
            <code className="text-xs">position</code>). Add a column with the
            dashed panel.
          </p>
        </header>
        <BoardListsGate board={board} />
      </div>
    </div>
  );
}
