import { NextResponse } from "next/server";

import { jsonError, readJsonBody } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { quoteCardTitle, recordActivity } from "@/lib/record-activity";
import { toCardDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await readJsonBody<{
    listId?: unknown;
    title?: unknown;
    description?: unknown;
    position?: unknown;
  }>(request);
  if (body === null) {
    return jsonError("Invalid JSON body", 400);
  }
  const listId = typeof body.listId === "string" ? body.listId.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!listId || !title) {
    return jsonError("listId and title are required", 400);
  }

  const list = await prisma.list.findUnique({ where: { id: listId } });
  if (!list) {
    return jsonError("List not found", 404);
  }

  const description =
    typeof body.description === "string" ? body.description : "";

  let position: number;
  if (typeof body.position === "number" && Number.isInteger(body.position)) {
    position = body.position;
  } else {
    const agg = await prisma.card.aggregate({
      where: { listId },
      _max: { position: true },
    });
    position = (agg._max.position ?? -1) + 1;
  }

  const card = await prisma.card.create({
    data: { listId, title, description, position },
  });
  await recordActivity({
    boardId: list.boardId,
    type: "card.created",
    summary: `Created card ${quoteCardTitle(title)}`,
    cardId: card.id,
  });
  return NextResponse.json(toCardDTO(card), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
