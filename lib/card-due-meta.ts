export type CardDueTone = "none" | "soon" | "today" | "overdue";

/**
 * Compact due label for card faces (BoardListsView). Uses local calendar day boundaries.
 */
export function cardDueMeta(iso: string | null): {
  label: string;
  title: string;
  tone: CardDueTone;
} | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;

  const startOfDay = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const now = new Date();
  const startToday = startOfDay(now);
  const startDue = startOfDay(d);
  const dayMs = 86_400_000;
  const diffDays = Math.round((startDue - startToday) / dayMs);

  const hasClock = d.getHours() !== 0 || d.getMinutes() !== 0;
  const timeSuffix = hasClock
    ? ` · ${d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`
    : "";

  const title = hasClock
    ? d.toLocaleString(undefined, {
        dateStyle: "full",
        timeStyle: "short",
      })
    : d.toLocaleDateString(undefined, { dateStyle: "full" });

  if (diffDays < 0) {
    const label =
      diffDays === -1
        ? `Yesterday${timeSuffix}`
        : `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}${timeSuffix}`;
    return { label, title, tone: "overdue" };
  }
  if (diffDays === 0) {
    return { label: `Today${timeSuffix}`, title, tone: "today" };
  }
  if (diffDays === 1) {
    return { label: `Tomorrow${timeSuffix}`, title, tone: "soon" };
  }
  if (diffDays <= 7) {
    return {
      label: `${d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}${timeSuffix}`,
      title,
      tone: "soon",
    };
  }
  return {
    label: `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}${timeSuffix}`,
    title,
    tone: "none",
  };
}
