import Link from "next/link";
import { notFound } from "next/navigation";

import {
  fetchBoardDetailFromApi,
  fetchWorkspaceFromApi,
} from "@/lib/fetch-board-api";

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

  const workspace = await fetchWorkspaceFromApi(board.workspaceId);
  const workspaceBoardsHref = workspace
    ? `/boards?workspaceId=${encodeURIComponent(board.workspaceId)}`
    : "/boards";
  const workspaceLabel = workspace?.name ?? "Boards";

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-[120rem]">
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <li className="text-muted-foreground">
              <Link
                href="/"
                className="underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Home
              </Link>
            </li>
            <li className="text-muted-foreground" aria-hidden="true">
              /
            </li>
            <li className="text-muted-foreground">
              <Link
                href={workspaceBoardsHref}
                className="underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {workspaceLabel}
              </Link>
            </li>
            <li className="text-muted-foreground" aria-hidden="true">
              /
            </li>
            <li
              className="max-w-[min(100%,28rem)] truncate font-medium text-foreground"
              aria-current="page"
            >
              {board.title}
            </li>
          </ol>
        </nav>
        <header className="mb-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Board
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance">
            {board.title}
          </h1>
          {workspace ? (
            <p className="mt-2 text-sm text-pretty text-muted-foreground">
              In workspace{" "}
              <Link
                href={workspaceBoardsHref}
                className="font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {workspace.name}
              </Link>
              . Open{" "}
              <Link
                href={workspaceBoardsHref}
                className="underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                all boards in this workspace
              </Link>
              .
            </p>
          ) : (
            <p className="mt-2 text-sm text-pretty text-muted-foreground">
              Workspace details are unavailable for this board.{" "}
              <Link
                href="/boards"
                className="font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Back to all boards
              </Link>
              .
            </p>
          )}
          <BoardMetaEditor
            boardId={board.id}
            initialDescription={board.description}
            initialVisibility={board.visibility}
          />
          <IncludeArchivedToggle
            boardId={board.id}
            includeArchived={includeArchived}
          />
          <p className="mt-4 text-sm text-pretty text-muted-foreground">
            Lists load from the API (ordered by{" "}
            <code className="rounded bg-muted/80 px-1 py-0.5 font-mono text-xs text-foreground">
              position
            </code>
            ). Add a column with the dashed panel.
          </p>
        </header>
        <BoardListsGate board={board} includeArchived={includeArchived} />
      </div>
    </div>
  );
}
