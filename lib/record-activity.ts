import { prisma } from "@/lib/prisma";

const COMMENT_SUMMARY_MAX = 80;

export function quoteCardTitle(title: string): string {
  return `"${title.replace(/"/g, "'")}"`;
}

export function truncateForSummary(text: string, max = COMMENT_SUMMARY_MAX): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

export type RecordActivityInput = {
  boardId: string;
  type: string;
  summary: string;
  actor?: string | null;
  cardId?: string | null;
  metadata?: string | null;
};

/** Append-only activity write; failures must not break callers. */
export async function recordActivity(input: RecordActivityInput): Promise<void> {
  try {
    await prisma.activityEntry.create({
      data: {
        boardId: input.boardId,
        type: input.type,
        summary: input.summary,
        actor: input.actor ?? null,
        cardId: input.cardId ?? null,
        metadata: input.metadata ?? null,
      },
    });
  } catch (err) {
    console.error("recordActivity failed:", err);
  }
}

export async function boardIdForCard(cardId: string): Promise<string | null> {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    select: { list: { select: { boardId: true } } },
  });
  return card?.list.boardId ?? null;
}
