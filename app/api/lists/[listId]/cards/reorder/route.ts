import { NextResponse } from "next/server";

import { jsonError, readJsonBody } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { toCardDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

/**
 * Card order within a list: body `{ cardIds: string[] }` is the new top-to-bottom order.
 * Assigns dense integer positions 0..n-1. Every card currently in the list must appear exactly once.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ listId: string }> },
) {
  const { listId } = await context.params;
  const body = await readJsonBody<{ cardIds?: unknown }>(request);
  if (body === null) {
    return jsonError("Invalid JSON body", 400);
  }
  if (!Array.isArray(body.cardIds)) {
    return jsonError("cardIds must be an array", 400);
  }
  const cardIds = body.cardIds.filter(
    (x): x is string => typeof x === "string" && x.trim().length > 0,
  );
  if (cardIds.length !== body.cardIds.length) {
    return jsonError("cardIds must be non-empty strings", 400);
  }
  if (new Set(cardIds).size !== cardIds.length) {
    return jsonError("cardIds must not contain duplicates", 400);
  }

  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: {
      cards: { select: { id: true } },
    },
  });
  if (!list) {
    return jsonError("List not found", 404);
  }

  const inList = new Set(list.cards.map((c) => c.id));
  if (cardIds.length !== inList.size) {
    return jsonError(
      "cardIds must include every card in this list exactly once",
      400,
    );
  }
  for (const id of cardIds) {
    if (!inList.has(id)) {
      return jsonError("card id does not belong to this list", 400);
    }
  }

  await prisma.$transaction(
    cardIds.map((id, position) =>
      prisma.card.update({
        where: { id },
        data: { position },
      }),
    ),
  );

  const cards = await prisma.card.findMany({
    where: { listId },
    orderBy: { position: "asc" },
  });

  return NextResponse.json(
    { cards: cards.map(toCardDTO) },
    { headers: { "Content-Type": "application/json" } },
  );
}
