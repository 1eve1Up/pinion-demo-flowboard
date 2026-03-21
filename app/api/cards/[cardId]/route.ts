import { NextResponse } from "next/server";

import { jsonError, readJsonBody } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { toCardDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ cardId: string }> },
) {
  const { cardId } = await context.params;
  const body = await readJsonBody<{
    title?: unknown;
    description?: unknown;
    listId?: unknown;
    position?: unknown;
  }>(request);
  if (body === null) {
    return jsonError("Invalid JSON body", 400);
  }

  const existing = await prisma.card.findUnique({
    where: { id: cardId },
    include: { list: { select: { boardId: true } } },
  });
  if (!existing) {
    return jsonError("Card not found", 404);
  }

  const data: {
    title?: string;
    description?: string;
    listId?: string;
    position?: number;
  } = {};

  if (body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim()) {
      return jsonError("title must be a non-empty string", 400);
    }
    data.title = body.title.trim();
  }
  if (body.description !== undefined) {
    if (typeof body.description !== "string") {
      return jsonError("description must be a string", 400);
    }
    data.description = body.description;
  }
  if (body.position !== undefined) {
    if (typeof body.position !== "number" || !Number.isInteger(body.position)) {
      return jsonError("position must be an integer", 400);
    }
    data.position = body.position;
  }
  if (body.listId !== undefined) {
    if (typeof body.listId !== "string" || !body.listId.trim()) {
      return jsonError("listId must be a non-empty string", 400);
    }
    const newListId = body.listId.trim();
    if (newListId !== existing.listId) {
      const targetList = await prisma.list.findUnique({
        where: { id: newListId },
        select: { boardId: true },
      });
      if (!targetList) {
        return jsonError("List not found", 404);
      }
      if (targetList.boardId !== existing.list.boardId) {
        return jsonError(
          "Target list does not belong to the same board as this card",
          400,
        );
      }
      data.listId = newListId;
    }
  }

  if (Object.keys(data).length === 0) {
    return jsonError("No valid fields to update", 400);
  }

  const card = await prisma.card.update({
    where: { id: cardId },
    data,
  });
  return NextResponse.json(toCardDTO(card), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ cardId: string }> },
) {
  const { cardId } = await context.params;
  const found = await prisma.card.findUnique({ where: { id: cardId } });
  if (!found) {
    return jsonError("Card not found", 404);
  }
  await prisma.card.delete({ where: { id: cardId } });
  return new NextResponse(null, { status: 204 });
}
