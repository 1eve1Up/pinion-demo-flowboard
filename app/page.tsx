import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-[min(70vh,32rem)] flex-col items-center justify-center px-4 py-16 sm:min-h-[65vh]">
      <main className="mx-auto w-full max-w-lg text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          FlowBoard
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Lightweight kanban boards
        </h1>
        <p className="mx-auto mt-4 max-w-md text-pretty text-lg text-muted-foreground">
          Create boards, add lists and cards, and move work across columns.
        </p>
        <Link
          href="/boards"
          className="mt-10 inline-flex min-h-11 min-w-[10rem] items-center justify-center rounded-lg bg-foreground px-6 py-2.5 text-sm font-medium text-background shadow-sm transition-[color,background-color,box-shadow] hover:bg-foreground/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Open boards
        </Link>
      </main>
    </div>
  );
}
