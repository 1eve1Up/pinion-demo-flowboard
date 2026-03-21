import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

type Params = Promise<{ boardId: string }>;

export default async function BoardDetailPage({
  params,
}: {
  params: Params;
}) {
  const { boardId } = await params;
  const board = await prisma.board.findUnique({
    where: { id: boardId },
  });

  if (!board) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <nav className="mb-8">
        <Link
          href="/boards"
          className="text-sm text-zinc-500 underline-offset-4 hover:text-zinc-800 hover:underline dark:hover:text-zinc-200"
        >
          ← Boards
        </Link>
      </nav>
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{board.title}</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Lists and cards will show here in the next steps.
        </p>
      </header>
    </div>
  );
}
