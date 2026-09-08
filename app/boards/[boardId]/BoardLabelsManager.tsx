"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { readApiErrorMessage } from "@/lib/read-api-error";
import type { LabelDTO } from "@/lib/serialize";

const COLOR_PRESETS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7"];

export function BoardLabelsManager({
  boardId,
  initialLabels,
}: {
  boardId: string;
  initialLabels: LabelDTO[];
}) {
  const router = useRouter();
  const [labels, setLabels] = useState(initialLabels);
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(COLOR_PRESETS[0]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refreshFromServer() {
    const res = await fetch(`/api/boards/${boardId}/labels`);
    if (!res.ok) return;
    const body = (await res.json()) as { labels: LabelDTO[] };
    setLabels(body.labels);
    router.refresh();
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name required");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/boards/${boardId}/labels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, color }),
      });
      if (!res.ok) {
        setError(await readApiErrorMessage(res, `Request failed (${res.status})`));
        return;
      }
      setName("");
      await refreshFromServer();
    } finally {
      setBusy(false);
    }
  }

  async function onRename(label: LabelDTO, nextName: string) {
    const trimmed = nextName.trim();
    if (!trimmed || trimmed === label.name) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/boards/${boardId}/labels/${label.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) {
        setError(await readApiErrorMessage(res, `Request failed (${res.status})`));
        return;
      }
      await refreshFromServer();
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(labelId: string) {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/boards/${boardId}/labels/${labelId}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        setError(await readApiErrorMessage(res, `Request failed (${res.status})`));
        return;
      }
      await refreshFromServer();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-700 dark:bg-zinc-900/40">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
        Labels
      </h2>
      <ul className="mt-2 flex flex-wrap gap-2">
        {labels.length === 0 ? (
          <li className="text-sm text-zinc-500">No labels yet.</li>
        ) : (
          labels.map((lab) => (
            <li
              key={lab.id}
              className="flex items-center gap-1 rounded-full border border-zinc-300 bg-white px-2 py-0.5 text-xs dark:border-zinc-600 dark:bg-zinc-950"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: lab.color ?? "#a1a1aa" }}
                aria-hidden
              />
              <input
                defaultValue={lab.name}
                disabled={busy}
                aria-label={`Rename label ${lab.name}`}
                className="w-24 border-0 bg-transparent p-0 text-xs outline-none focus:ring-0"
                onBlur={(e) => void onRename(lab, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    (e.target as HTMLInputElement).blur();
                  }
                }}
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => void onDelete(lab.id)}
                className="text-zinc-400 hover:text-red-600"
                aria-label={`Delete label ${lab.name}`}
              >
                ×
              </button>
            </li>
          ))
        )}
      </ul>
      <form onSubmit={(e) => void onCreate(e)} className="mt-3 flex flex-wrap items-end gap-2">
        <div>
          <label
            htmlFor={`board-${boardId}-new-label`}
            className="block text-[10px] font-medium uppercase text-zinc-500"
          >
            New label
          </label>
          <input
            id={`board-${boardId}-new-label`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={busy}
            className="mt-0.5 rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          />
        </div>
        <div className="flex items-center gap-1" role="group" aria-label="Label color">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              disabled={busy}
              onClick={() => setColor(c)}
              className={`h-6 w-6 rounded-full border-2 ${
                color === c ? "border-zinc-900 dark:border-zinc-100" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
              aria-pressed={color === c}
            />
          ))}
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded bg-zinc-800 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900"
        >
          Add
        </button>
      </form>
      {error ? (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
