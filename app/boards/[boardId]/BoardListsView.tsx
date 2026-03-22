"use client";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";

import type { BoardDetailDTO, CardDTO, ListDTO } from "@/lib/serialize";

function droppableIdForList(listId: string) {
  return `droppable-list-${listId}`;
}

function CardRow({
  card,
  listId,
  onSaved,
}: {
  card: CardDTO;
  listId: string;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: card.id,
      disabled: editing,
    });

  const dragStyle = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  useEffect(() => {
    setTitle(card.title);
  }, [card.id, card.title]);

  async function save() {
    setError(null);
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Title required");
      setTitle(card.title);
      setEditing(false);
      return;
    }
    if (trimmed === card.title) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? `Save failed (${res.status})`);
        setTitle(card.title);
        return;
      }
      setEditing(false);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <li className="rounded border border-zinc-300 bg-white p-1 dark:border-zinc-500 dark:bg-zinc-950">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => void save()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void save();
            }
            if (e.key === "Escape") {
              setTitle(card.title);
              setEditing(false);
              setError(null);
            }
          }}
          disabled={saving}
          className="w-full rounded px-1 py-0.5 text-sm outline-none ring-zinc-400 focus:ring-2"
          aria-label={`Edit card in list ${listId}`}
        />
        {error ? (
          <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{error}</p>
        ) : null}
      </li>
    );
  }

  return (
    <li
      ref={setNodeRef}
      style={dragStyle}
      className={isDragging ? "z-10 opacity-60" : ""}
    >
      <button
        type="button"
        {...listeners}
        {...attributes}
        onClick={() => setEditing(true)}
        className="w-full cursor-grab touch-none rounded border border-zinc-200 bg-white px-2 py-1.5 text-left text-sm hover:border-zinc-300 active:cursor-grabbing dark:border-zinc-600 dark:bg-zinc-950 dark:hover:border-zinc-500"
        aria-grabbed={isDragging}
      >
        {card.title}
      </button>
    </li>
  );
}

function ListColumn({ list }: { list: ListDTO }) {
  const router = useRouter();
  const [cardTitle, setCardTitle] = useState("");
  const [addPending, setAddPending] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const { setNodeRef, isOver } = useDroppable({
    id: droppableIdForList(list.id),
  });

  async function addCard(e: FormEvent) {
    e.preventDefault();
    setAddError(null);
    const trimmed = cardTitle.trim();
    if (!trimmed) {
      setAddError("Card title is required.");
      return;
    }
    setAddPending(true);
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listId: list.id,
          title: trimmed,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setAddError(body.error ?? `Could not add card (${res.status})`);
        return;
      }
      setCardTitle("");
      router.refresh();
    } finally {
      setAddPending(false);
    }
  }

  return (
    <section
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
      <div className="flex min-h-[120px] flex-1 flex-col px-2 py-2">
        <div
          ref={setNodeRef}
          className={`mb-2 min-h-[4.5rem] flex-1 rounded-md px-0.5 py-0.5 transition-colors ${
            isOver
              ? "bg-zinc-200/80 ring-2 ring-zinc-400 dark:bg-zinc-800/80 dark:ring-zinc-500"
              : ""
          }`}
        >
          {list.cards.length === 0 ? (
            <p className="px-1 py-2 text-xs text-zinc-500">
              Drop cards here or add below
            </p>
          ) : (
            <ul className="space-y-1">
              {list.cards.map((c) => (
                <CardRow
                  key={c.id}
                  card={c}
                  listId={list.id}
                  onSaved={() => router.refresh()}
                />
              ))}
            </ul>
          )}
        </div>
        <form
          className="mt-auto flex flex-col gap-1 border-t border-zinc-200 pt-2 dark:border-zinc-700"
          onSubmit={addCard}
        >
          {addError ? (
            <p className="text-xs text-red-600 dark:text-red-400" role="alert">
              {addError}
            </p>
          ) : null}
          <input
            type="text"
            value={cardTitle}
            onChange={(e) => setCardTitle(e.target.value)}
            placeholder="New card title"
            autoComplete="off"
            disabled={addPending}
            className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
          <button
            type="submit"
            disabled={addPending}
            className="rounded-md bg-zinc-800 py-1.5 text-xs font-medium text-white disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900"
          >
            {addPending ? "Adding…" : "Add card"}
          </button>
        </form>
      </div>
    </section>
  );
}

export function BoardListsView({ board }: { board: BoardDetailDTO }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor),
  );

  const onDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const cardId = String(active.id);
      const overId = String(over.id);
      const prefix = "droppable-list-";
      if (!overId.startsWith(prefix)) return;

      const targetListId = overId.slice(prefix.length);

      let sourceListId: string | null = null;
      for (const l of board.lists) {
        if (l.cards.some((c) => c.id === cardId)) {
          sourceListId = l.id;
          break;
        }
      }
      if (!sourceListId) return;
      if (sourceListId === targetListId) return;

      const targetList = board.lists.find((l) => l.id === targetListId);
      if (!targetList) return;

      const maxPos = targetList.cards.reduce(
        (m, c) => Math.max(m, c.position),
        -1,
      );
      const newPosition = maxPos + 1;

      const res = await fetch(`/api/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listId: targetListId,
          position: newPosition,
        }),
      });

      if (res.ok) {
        router.refresh();
      }
    },
    [board.lists, router],
  );

  async function onSubmitList(e: FormEvent) {
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={(e) => void onDragEnd(e)}
    >
      <div className="mt-8 flex gap-4 overflow-x-auto pb-2">
        {board.lists.map((list) => (
          <ListColumn key={list.id} list={list} />
        ))}

        <div className="w-72 shrink-0 rounded-lg border border-dashed border-zinc-300 bg-white p-3 dark:border-zinc-600 dark:bg-zinc-950">
          <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Add list
          </h2>
          <form className="mt-3 flex flex-col gap-2" onSubmit={onSubmitList}>
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
    </DndContext>
  );
}
