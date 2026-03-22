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
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

import type { BoardDetailDTO, CardDTO, ListDTO } from "@/lib/serialize";

function droppableIdForList(listId: string) {
  return `droppable-list-${listId}`;
}

function isoToDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function datetimeLocalValueToIso(value: string): string | null {
  const t = value.trim();
  if (!t) return null;
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

const COLUMN_DRAG_PREFIX = "column-drag-";
const COLUMN_DROP_PREFIX = "column-drop-";

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function CardDetailPanel({
  card,
  onSaved,
  onClose,
}: {
  card: CardDTO;
  onSaved: () => void;
  onClose: () => void;
}) {
  const [description, setDescription] = useState(card.description);
  const [dueLocal, setDueLocal] = useState(() =>
    isoToDatetimeLocalValue(card.dueDate),
  );
  const [archived, setArchived] = useState(card.archived);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDescription(card.description);
    setDueLocal(isoToDatetimeLocalValue(card.dueDate));
    setArchived(card.archived);
  }, [card.id, card.description, card.dueDate, card.archived]);

  async function saveDetails() {
    setError(null);
    setSaving(true);
    try {
      const dueDate =
        dueLocal.trim() === "" ? null : datetimeLocalValueToIso(dueLocal);
      if (dueLocal.trim() !== "" && dueDate === null) {
        setError("Due date is invalid.");
        return;
      }
      const res = await fetch(`/api/cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          archived,
          dueDate,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? `Save failed (${res.status})`);
        return;
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-1 space-y-2 rounded border border-zinc-200 bg-zinc-50 p-2 text-left dark:border-zinc-600 dark:bg-zinc-900/80">
      <div>
        <label
          className="text-[10px] font-medium uppercase text-zinc-500 dark:text-zinc-400"
          htmlFor={`card-${card.id}-desc`}
        >
          Description
        </label>
        <textarea
          id={`card-${card.id}-desc`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          disabled={saving}
          className="mt-0.5 w-full resize-y rounded border border-zinc-300 bg-white px-1.5 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-950"
        />
      </div>
      <div>
        <label
          className="text-[10px] font-medium uppercase text-zinc-500 dark:text-zinc-400"
          htmlFor={`card-${card.id}-due`}
        >
          Due
        </label>
        <input
          id={`card-${card.id}-due`}
          type="datetime-local"
          value={dueLocal}
          onChange={(e) => setDueLocal(e.target.value)}
          disabled={saving}
          className="mt-0.5 w-full rounded border border-zinc-300 bg-white px-1.5 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-950"
        />
      </div>
      <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={archived}
          onChange={(e) => setArchived(e.target.checked)}
          disabled={saving}
          className="rounded border-zinc-400 dark:border-zinc-500"
        />
        Archived
      </label>
      {error ? (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => void saveDetails()}
          className="rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-white disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900"
        >
          {saving ? "Saving…" : "Save card"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onClose}
          className="rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
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
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    disabled: editing || expanded,
  });

  const dragStyle: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    setTitle(card.title);
  }, [card.id, card.title]);

  async function saveTitle() {
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
      <li
        ref={setNodeRef}
        style={dragStyle}
        className="rounded border border-zinc-300 bg-white p-1 dark:border-zinc-500 dark:bg-zinc-950"
      >
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => void saveTitle()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void saveTitle();
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
      className={`rounded border border-zinc-200 bg-white dark:border-zinc-600 dark:bg-zinc-950 ${
        isDragging ? "z-10 opacity-60" : ""
      } ${card.archived ? "opacity-80" : ""}`}
    >
      <div className="flex items-stretch gap-0.5 p-0.5">
        <button
          ref={setActivatorNodeRef}
          type="button"
          className="touch-none shrink-0 cursor-grab rounded px-1 py-1.5 text-zinc-400 hover:bg-zinc-100 active:cursor-grabbing dark:hover:bg-zinc-800"
          aria-label={`Drag card ${card.title}`}
          {...listeners}
          {...attributes}
          aria-grabbed={isDragging}
        >
          <span className="text-xs leading-none" aria-hidden>
            ⋮⋮
          </span>
        </button>
        <button
          type="button"
          onClick={() => setEditing(true)}
          disabled={expanded}
          className="min-w-0 flex-1 rounded px-1.5 py-1.5 text-left text-sm hover:bg-zinc-50 disabled:opacity-60 dark:hover:bg-zinc-900"
        >
          <span
            className={
              card.archived ? "line-through decoration-zinc-400" : undefined
            }
          >
            {card.title}
          </span>
          {card.archived ? (
            <span className="ml-1 text-[10px] font-medium uppercase text-zinc-400">
              archived
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="shrink-0 rounded px-1.5 py-1 text-xs text-zinc-600 underline-offset-2 hover:bg-zinc-100 hover:underline dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          {expanded ? "Close" : "Details"}
        </button>
      </div>
      {expanded ? (
        <CardDetailPanel
          card={card}
          onSaved={onSaved}
          onClose={() => setExpanded(false)}
        />
      ) : null}
    </li>
  );
}

function ColumnDragHandle({
  listId,
  title,
}: {
  listId: string;
  title: string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `${COLUMN_DRAG_PREFIX}${listId}`,
    });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 border-b border-zinc-200 px-2 py-2 dark:border-zinc-700 ${
        isDragging ? "z-20 opacity-80" : ""
      }`}
    >
      <button
        type="button"
        className="touch-none rounded p-1 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 active:cursor-grabbing dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        aria-label={`Reorder column ${title}`}
        {...listeners}
        {...attributes}
      >
        <span className="block text-xs leading-none" aria-hidden>
          ⋮⋮
        </span>
      </button>
      <h2
        id={`list-${listId}-title`}
        className="min-w-0 flex-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50"
      >
        {title}
      </h2>
    </div>
  );
}

function ColumnDropShell({
  listId,
  children,
}: {
  listId: string;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${COLUMN_DROP_PREFIX}${listId}`,
  });

  return (
    <section
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50 ${
        isOver
          ? "ring-2 ring-zinc-400 dark:ring-zinc-500"
          : ""
      }`}
      aria-labelledby={`list-${listId}-title`}
    >
      {children}
    </section>
  );
}

function ListColumnBody({ list }: { list: ListDTO }) {
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
    <>
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
            <SortableContext
              items={list.cards.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
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
            </SortableContext>
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
    </>
  );
}

export function BoardListsView({
  board,
  includeArchived,
}: {
  board: BoardDetailDTO;
  /** When true, server included archived cards in list payloads. */
  includeArchived: boolean;
}) {
  const router = useRouter();
  const [lists, setLists] = useState(board.lists);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [columnReorderError, setColumnReorderError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setLists(board.lists);
  }, [board.lists]);

  const columnSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor),
  );

  const cardSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onColumnDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setColumnReorderError(null);
      const { active, over } = event;
      if (!over) return;

      const a = String(active.id);
      const o = String(over.id);
      if (!a.startsWith(COLUMN_DRAG_PREFIX) || !o.startsWith(COLUMN_DROP_PREFIX)) {
        return;
      }
      const fromListId = a.slice(COLUMN_DRAG_PREFIX.length);
      const toListId = o.slice(COLUMN_DROP_PREFIX.length);
      if (fromListId === toListId) return;

      const oldIndex = lists.findIndex((l) => l.id === fromListId);
      const newIndex = lists.findIndex((l) => l.id === toListId);
      if (oldIndex < 0 || newIndex < 0) return;

      const reordered = arrayMove(lists, oldIndex, newIndex);
      const previous = lists;
      setLists(reordered);

      const res = await fetch(
        `/api/boards/${board.id}/lists/reorder`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listIds: reordered.map((l) => l.id),
          }),
        },
      );

      if (!res.ok) {
        setLists(previous);
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setColumnReorderError(
          body.error ?? `Could not reorder columns (${res.status})`,
        );
        return;
      }

      router.refresh();
    },
    [board.id, lists, router],
  );

  const onCardDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);
      const droppablePrefix = "droppable-list-";

      let sourceList: ListDTO | undefined;
      let sourceListId: string | null = null;
      for (const l of lists) {
        if (l.cards.some((c) => c.id === activeId)) {
          sourceList = l;
          sourceListId = l.id;
          break;
        }
      }
      if (!sourceList || !sourceListId) return;

      const overIsCard = lists.some((l) =>
        l.cards.some((c) => c.id === overId),
      );

      if (overIsCard) {
        const overList = lists.find((l) => l.cards.some((c) => c.id === overId));
        if (!overList) return;

        if (overList.id === sourceListId) {
          const oldIndex = sourceList.cards.findIndex((c) => c.id === activeId);
          const newIndex = sourceList.cards.findIndex((c) => c.id === overId);
          if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;

          const reordered = arrayMove(sourceList.cards, oldIndex, newIndex);
          const previous = lists;
          setLists(
            lists.map((l) =>
              l.id === sourceListId ? { ...l, cards: reordered } : l,
            ),
          );

          const res = await fetch(`/api/lists/${sourceListId}/cards/reorder`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cardIds: reordered.map((c) => c.id),
            }),
          });

          if (!res.ok) {
            setLists(previous);
            return;
          }
          router.refresh();
          return;
        }

        const maxPos = overList.cards.reduce(
          (m, c) => Math.max(m, c.position),
          -1,
        );
        const newPosition = maxPos + 1;

        const res = await fetch(`/api/cards/${activeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listId: overList.id,
            position: newPosition,
          }),
        });

        if (res.ok) {
          router.refresh();
        }
        return;
      }

      if (!overId.startsWith(droppablePrefix)) return;

      const targetListId = overId.slice(droppablePrefix.length);
      if (sourceListId === targetListId) return;

      const targetList = lists.find((l) => l.id === targetListId);
      if (!targetList) return;

      const maxPos = targetList.cards.reduce(
        (m, c) => Math.max(m, c.position),
        -1,
      );
      const newPosition = maxPos + 1;

      const res = await fetch(`/api/cards/${activeId}`, {
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
    [lists, router],
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
      sensors={columnSensors}
      collisionDetection={closestCorners}
      onDragEnd={(e) => void onColumnDragEnd(e)}
    >
      {columnReorderError ? (
        <p className="mb-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {columnReorderError}
        </p>
      ) : null}
      {includeArchived ? (
        <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
          Archived cards are shown in columns. Turn off &quot;Show archived
          cards&quot; above to hide them again.
        </p>
      ) : null}
      <div className="mt-8 flex gap-4 overflow-x-auto pb-2">
        {lists.map((list) => (
          <ColumnDropShell key={list.id} listId={list.id}>
            <ColumnDragHandle listId={list.id} title={list.title} />
            <DndContext
              sensors={cardSensors}
              collisionDetection={closestCorners}
              onDragEnd={(e) => void onCardDragEnd(e)}
            >
              <ListColumnBody list={list} />
            </DndContext>
          </ColumnDropShell>
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
