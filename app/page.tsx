import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <main className="max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          FlowBoard
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Lightweight kanban boards
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Create boards, add lists and cards, and move work across columns.
        </p>
        <Link
          href="/boards"
          className="mt-8 inline-flex rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Open boards
        </Link>
      </main>
    </div>
  );
}
