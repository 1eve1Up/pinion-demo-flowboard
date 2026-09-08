import { cardDueMeta, type CardDueTone } from "@/lib/card-due-meta";
import type { CardDTO, ListDTO } from "@/lib/serialize";

export type BoardCardFilters = {
  /** Match label by id or exact name (case-insensitive). */
  label?: string | null;
  /** Due window: overdue | today | soon | none (no due date). */
  due?: string | null;
  /** Case-insensitive substring on title or description. */
  keyword?: string | null;
};

const DUE_WINDOWS = new Set(["overdue", "today", "soon", "none"]);

export function parseBoardCardFilters(
  searchParams: URLSearchParams,
): BoardCardFilters {
  const label = searchParams.get("label")?.trim() || null;
  const dueRaw = searchParams.get("due")?.trim().toLowerCase() || null;
  const due = dueRaw || null;
  const keyword = searchParams.get("keyword")?.trim() || null;
  return { label, due, keyword };
}

export function hasActiveCardFilters(f: BoardCardFilters): boolean {
  return Boolean(f.label || f.due || f.keyword);
}

function cardMatchesFilters(card: CardDTO, filters: BoardCardFilters): boolean {
  if (filters.label) {
    const needle = filters.label.toLowerCase();
    const hit = card.labels.some(
      (l) => l.id === filters.label || l.name.toLowerCase() === needle,
    );
    if (!hit) return false;
  }

  if (filters.due) {
    const window = filters.due.toLowerCase();
    if (!DUE_WINDOWS.has(window)) {
      return false;
    }
    if (window === "none") {
      if (card.dueDate != null) return false;
    } else {
      if (!card.dueDate) return false;
      const meta = cardDueMeta(card.dueDate);
      if (!meta || meta.tone !== (window as CardDueTone)) return false;
    }
  }

  if (filters.keyword) {
    const q = filters.keyword.toLowerCase();
    const hay = `${card.title}\n${card.description}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }

  return true;
}

/** Filter cards inside each list; list shells remain even when empty. */
export function filterBoardLists(
  lists: ListDTO[],
  filters: BoardCardFilters,
): ListDTO[] {
  if (!hasActiveCardFilters(filters)) return lists;
  return lists.map((list) => ({
    ...list,
    cards: list.cards.filter((c) => cardMatchesFilters(c, filters)),
  }));
}
