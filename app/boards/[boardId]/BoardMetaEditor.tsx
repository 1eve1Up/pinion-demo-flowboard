"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import type { BoardDTO } from "@/lib/serialize";

type BoardVisibility = BoardDTO["visibility"];

const VISIBILITY_OPTIONS: BoardVisibility[] = [
  "private",
  "workspace",
  "public",
];

export function BoardMetaEditor({
  boardId,
  initialDescription,
  initialVisibility,
}: {
  boardId: string;
  initialDescription: string;
  initialVisibility: BoardVisibility;
}) {
  const router = useRouter();
  const panelId = `board-${boardId}-settings-panel`;
  const fieldsRegionId = `${panelId}-fields`;
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [description, setDescription] = useState(initialDescription);
  const [visibility, setVisibility] =
    useState<BoardVisibility>(initialVisibility);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDescription(initialDescription);
    setVisibility(initialVisibility);
  }, [boardId, initialDescription, initialVisibility]);

  const dirty =
    description !== initialDescription || visibility !== initialVisibility;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, visibility }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? `Save failed (${res.status})`);
        return;
      }
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      id={panelId}
      className="mt-4 max-w-2xl space-y-3 rounded-lg border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-900/40"
      onSubmit={(e) => void onSubmit(e)}
    >
      <button
        type="button"
        aria-expanded={settingsOpen}
        aria-controls={fieldsRegionId}
        onClick={() => setSettingsOpen((o) => !o)}
        className="text-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {settingsOpen ? "Hide board settings" : "Board settings"}
      </button>
      {settingsOpen ? (
        <div id={fieldsRegionId} className="space-y-3">
          <div>
            <label
              htmlFor={`board-${boardId}-description`}
              className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
            >
              Description
            </label>
            <textarea
              id={`board-${boardId}-description`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={saving}
              className="mt-1 w-full resize-y rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[12rem] flex-1">
              <label
                htmlFor={`board-${boardId}-visibility`}
                className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
              >
                Visibility
              </label>
              <select
                id={`board-${boardId}-visibility`}
                value={visibility}
                onChange={(e) =>
                  setVisibility(e.target.value as BoardVisibility)
                }
                disabled={saving}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
              >
                {VISIBILITY_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={saving || !dirty}
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {saving ? "Saving…" : "Save board"}
            </button>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Visibility is stored for API alignment; this demo does not enforce
            access control.
          </p>
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
