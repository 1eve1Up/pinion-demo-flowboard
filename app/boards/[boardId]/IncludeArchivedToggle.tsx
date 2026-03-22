"use client";

import { usePathname, useRouter } from "next/navigation";

export function IncludeArchivedToggle({
  boardId,
  includeArchived,
}: {
  boardId: string;
  includeArchived: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const inputId = `board-${boardId}-include-archived`;

  function onChange() {
    const next = !includeArchived;
    const url = next ? `${pathname}?includeArchived=true` : pathname;
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
