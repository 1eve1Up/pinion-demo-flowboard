"use client";

import { FormEvent, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import type { LabelDTO } from "@/lib/serialize";

function buildBoardQuery(opts: {
  includeArchived: boolean;
  label: string;
  due: string;
  keyword: string;
}): string {
  const q = new URLSearchParams();
  if (opts.includeArchived) q.set("includeArchived", "true");
  if (opts.label) q.set("label", opts.label);
  if (opts.due) q.set("due", opts.due);
  if (opts.keyword) q.set("keyword", opts.keyword);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function BoardFilters({
  boardId,
  labels,
  includeArchived,
  initialLabel,
  initialDue,
  initialKeyword,
}: {
  boardId: string;
  labels: LabelDTO[];
  includeArchived: boolean;
  initialLabel: string;
  initialDue: string;
  initialKeyword: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [label, setLabel] = useState(initialLabel);
  const [due, setDue] = useState(initialDue);
  const [keyword, setKeyword] = useState(initialKeyword);

  function apply(next: { label: string; due: string; keyword: string }) {
    const url =
      pathname +
      buildBoardQuery({
        includeArchived,
        label: next.label,
        due: next.due,
        keyword: next.keyword,
      });
    router.replace(url);
    router.refresh();
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    apply({ label, due, keyword: keyword.trim() });
  }

  function onClear() {
    setLabel("");
    setDue("");
    setKeyword("");
    apply({ label: "", due: "", keyword: "" });
  }

  const labelId = `board-${boardId}-filter-label`;
  const dueId = `board-${boardId}-filter-due`;
  const keywordId = `board-${boardId}-filter-keyword`;

  return (
    <form
      onSubmit={onSubmit}
      className="mt-4 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950"
      aria-label="Filter cards on this board"
    >
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label
            htmlFor={labelId}
            className="block text-[10px] font-medium uppercase text-zinc-500"
          >
            Label
          </label>
          <select
            id={labelId}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="mt-0.5 rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          >
            <option value="">Any</option>
            {labels.map((lab) => (
              <option key={lab.id} value={lab.id}>
                {lab.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor={dueId}
            className="block text-[10px] font-medium uppercase text-zinc-500"
          >
            Due
          </label>
          <select
            id={dueId}
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="mt-0.5 rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          >
            <option value="">Any</option>
            <option value="overdue">Overdue</option>
            <option value="today">Today</option>
            <option value="soon">Soon</option>
            <option value="none">No due date</option>
          </select>
        </div>
        <div className="min-w-[12rem] flex-1">
          <label
            htmlFor={keywordId}
            className="block text-[10px] font-medium uppercase text-zinc-500"
          >
            Keyword
          </label>
          <input
            id={keywordId}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Title or description"
            className="mt-0.5 w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-zinc-800 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-200 dark:text-zinc-900"
        >
          Apply filters
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
