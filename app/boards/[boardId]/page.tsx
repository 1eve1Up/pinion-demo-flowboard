import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchBoardDetailFromApi } from "@/lib/fetch-board-api";

import { BoardListsGate } from "./BoardListsGate";
import { BoardMetaEditor } from "./BoardMetaEditor";
import { IncludeArchivedToggle } from "./IncludeArchivedToggle";

export const dynamic = "force-dynamic";

type Params = Promise<{ boardId: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function parseIncludeArchived(
  raw: string | string[] | undefined,
): boolean {
  if (raw == null) return false;
  const v = (Array.isArray(raw) ? raw[0] : raw).trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

export default async function BoardDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { boardId } = await params;
  const sp = await searchParams;
  const includeArchived = parseIncludeArchived(sp.includeArchived);
  const board = await fetchBoardDetailFromApi(boardId, { includeArchived });

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
          <IncludeArchivedToggle includeArchived={includeArchived} />
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Lists load from the API (ordered by{" "}
            <code className="text-xs">position</code>). Add a column with the
            dashed panel.
          </p>
        </header>
        <BoardListsGate board={board} includeArchived={includeArchived} />
      </div>
    </div>
  );
}
