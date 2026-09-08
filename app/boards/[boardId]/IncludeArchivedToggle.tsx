"use client";

import { usePathname, useRouter } from "next/navigation";

function buildBoardQuery(opts: {
  includeArchived: boolean;
  label?: string;
  due?: string;
  keyword?: string;
}): string {
  const q = new URLSearchParams();
  if (opts.includeArchived) q.set("includeArchived", "true");
  if (opts.label) q.set("label", opts.label);
  if (opts.due) q.set("due", opts.due);
  if (opts.keyword) q.set("keyword", opts.keyword);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function IncludeArchivedToggle({
  boardId,
  includeArchived,
  label,
  due,
  keyword,
}: {
  boardId: string;
  includeArchived: boolean;
  label?: string;
  due?: string;
  keyword?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const inputId = `board-${boardId}-include-archived`;

  function onChange() {
    const next = !includeArchived;
    const url =
      pathname +
      buildBoardQuery({
        includeArchived: next,
        label,
        due,
        keyword,
      });
    router.replace(url);
    router.refresh();
  }

  return (
    <div className="mt-3 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
      <input
        id={inputId}
        type="checkbox"
        className="rounded border-zinc-400 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-500 dark:bg-zinc-900"
        checked={includeArchived}
        onChange={onChange}
      />
      <label htmlFor={inputId} className="cursor-pointer">
        Show archived cards
      </label>
    </div>
  );
}
