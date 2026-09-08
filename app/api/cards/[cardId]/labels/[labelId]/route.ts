import { NextResponse } from "next/server";

import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { quoteCardTitle, recordActivity } from "@/lib/record-activity";
import { toCardDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

const cardLabelInclude = {
  labels: {
    include: { label: true },
    orderBy: { label: { name: "asc" as const } },
  },
};

/** Attach a board label to a card (idempotent). */
export async function PUT(
  _request: Request,
  context: { params: Promise<{ cardId: string; labelId: string }> },
) {
  const { cardId, labelId } = await context.params;

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { list: { select: { boardId: true } } },
  });
  if (!card) {
    return jsonError("Card not found", 404);
  }

  const label = await prisma.label.findUnique({ where: { id: labelId } });
  if (!label) {
    return jsonError("Label not found", 404);
  }
  if (label.boardId !== card.list.boardId) {
    return jsonError("Label does not belong to the same board as this card", 400);
  }

  const existingLink = await prisma.cardLabel.findUnique({
    where: { cardId_labelId: { cardId, labelId } },
  });

  await prisma.cardLabel.upsert({
    where: { cardId_labelId: { cardId, labelId } },
    create: { cardId, labelId },
    update: {},
  });

  if (!existingLink) {
    await recordActivity({
      boardId: card.list.boardId,
      type: "label.attached",
      summary: `Added label ${quoteCardTitle(label.name)} to ${quoteCardTitle(card.title)}`,
      cardId,
    });
  }

  const updated = await prisma.card.findUniqueOrThrow({
    where: { id: cardId },
    include: cardLabelInclude,
  });
  return NextResponse.json(toCardDTO(updated), {
    headers: { "Content-Type": "application/json" },
  });
}

/** Detach a label from a card (idempotent if already detached). */
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ cardId: string; labelId: string }> },
) {
  const { cardId, labelId } = await context.params;

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { list: { select: { boardId: true } } },
  });
  if (!card) {
    return jsonError("Card not found", 404);
  }

  const label = await prisma.label.findUnique({ where: { id: labelId } });

  const deleted = await prisma.cardLabel.deleteMany({ where: { cardId, labelId } });

  if (deleted.count > 0 && label) {
    await recordActivity({
      boardId: card.list.boardId,
      type: "label.detached",
      summary: `Removed label ${quoteCardTitle(label.name)} from ${quoteCardTitle(card.title)}`,
      cardId,
    });
  }

  const updated = await prisma.card.findUniqueOrThrow({
    where: { id: cardId },
    include: cardLabelInclude,
  });
  return NextResponse.json(toCardDTO(updated), {
    headers: { "Content-Type": "application/json" },
  });
}
