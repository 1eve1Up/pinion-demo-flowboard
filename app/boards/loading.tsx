export default function BoardsLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-10 flex animate-pulse items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-8 w-40 rounded-md bg-muted" />
          <div className="h-4 w-72 max-w-full rounded bg-muted" />
        </div>
        <div className="h-4 w-14 rounded bg-muted" />
      </header>
      <div
        className="mb-8 animate-pulse rounded-xl border border-border bg-muted/30 p-5"
        aria-hidden
      >
        <div className="h-4 w-28 rounded bg-muted" />
        <div className="mt-4 space-y-2">
          <div className="h-10 rounded-lg bg-muted" />
          <div className="h-10 rounded-lg bg-muted" />
        </div>
        <div className="mt-5 border-t border-border pt-5">
          <div className="h-10 rounded-lg bg-muted" />
        </div>
      </div>
      <div className="animate-pulse space-y-3" aria-hidden>
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-11 rounded-lg bg-muted" />
      </div>
      <div className="mt-10 h-32 animate-pulse rounded-xl border border-dashed border-border bg-muted/20" />
    </div>
  );
}
