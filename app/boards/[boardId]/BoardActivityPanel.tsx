"use client";

import { useState } from "react";

import { readApiErrorMessage } from "@/lib/read-api-error";
import type { ActivityEntryDTO } from "@/lib/serialize";

function formatActivityTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function BoardActivityPanel({ boardId }: { boardId: string }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [activities, setActivities] = useState<ActivityEntryDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadActivity() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/boards/${boardId}/activity?limit=50`);
      if (!res.ok) {
        setError(
          await readApiErrorMessage(res, `Activity failed (${res.status})`),
        );
        setActivities([]);
        return;
      }
      const body = (await res.json()) as {
        activities?: ActivityEntryDTO[];
      };
      setActivities(body.activities ?? []);
      setLoaded(true);
    } catch {
      setError("Could not load activity.");
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }

  function onToggle() {
    const next = !open;
    setOpen(next);
    if (next && !loaded && !loading) {
      void loadActivity();
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-950">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500"
      >
        <span>Activity</span>
        <span className="text-xs text-zinc-500" aria-hidden="true">
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open ? (
        <div className="border-t border-zinc-200 px-3 py-2 dark:border-zinc-700">
          {loading ? (
            <p className="text-xs text-zinc-500" role="status">
              Loading activity…
            </p>
          ) : error ? (
            <p className="text-xs text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : activities.length === 0 ? (
            <p className="text-xs text-zinc-500">No activity yet.</p>
          ) : (
            <ul className="max-h-48 space-y-2 overflow-y-auto text-xs">
              {activities.map((entry) => (
                <li key={entry.id} className="border-b border-zinc-100 pb-2 last:border-0 dark:border-zinc-800">
                  <p className="text-foreground">{entry.summary}</p>
                  <div className="mt-0.5 flex flex-wrap gap-x-2 text-[10px] text-zinc-500">
                    {entry.actor ? (
                      <span>{entry.actor}</span>
                    ) : null}
                    <time dateTime={entry.createdAt}>
                      {formatActivityTime(entry.createdAt)}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
