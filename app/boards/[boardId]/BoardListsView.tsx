"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

import type { BoardDetailDTO } from "@/lib/serialize";

export function BoardListsView({ board }: { board: BoardDetailDTO }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = title.trim();
    if (!trimmed) {
      setError("List name is required.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boardId: board.id,
          title: trimmed,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setError(body.error ?? `Could not create list (${res.status})`);
        return;
      }
      setTitle("");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-8 flex gap-4 overflow-x-auto pb-2">
      {board.lists.map((list) => (
        <section
          key={list.id}
          className="flex w-72 shrink-0 flex-col rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50"
          aria-labelledby={`list-${list.id}-title`}
        >
          <div className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-700">
            <h2
              id={`list-${list.id}-title`}
              className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
            >
              {list.title}
            </h2>
          </div>
          <div className="min-h-[120px] flex-1 px-2 py-2">
            {list.cards.length === 0 ? (
              <p className="px-1 text-xs text-zinc-500">No cards yet</p>
            ) : (
              <ul className="space-y-1">
                {list.cards.map((c) => (
                  <li
                    key={c.id}
                    className="rounded border border-zinc-200 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-950"
                  >
                    {c.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}

      <div className="w-72 shrink-0 rounded-lg border border-dashed border-zinc-300 bg-white p-3 dark:border-zinc-600 dark:bg-zinc-950">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Add list
        </h2>
        <form className="mt-3 flex flex-col gap-2" onSubmit={onSubmit}>
          {error ? (
            <p className="text-xs text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Column name"
            autoComplete="off"
            disabled={pending}
            className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-zinc-900 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {pending ? "Adding…" : "Add list"}
          </button>
        </form>
      </div>
    </div>
  );
}
