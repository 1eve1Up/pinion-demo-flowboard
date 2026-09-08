import { NextResponse } from "next/server";

import { jsonError, readJsonBody } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import {
  quoteCardTitle,
  recordActivity,
  truncateForSummary,
} from "@/lib/record-activity";
import { toCommentDTO, toCommentDTOs } from "@/lib/serialize";

export const dynamic = "force-dynamic";

async function findCard(cardId: string) {
  return prisma.card.findUnique({
    where: { id: cardId },
    include: { list: { select: { boardId: true } } },
  });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ cardId: string }> },
) {
  const { cardId } = await context.params;
  const card = await findCard(cardId);
  if (!card) {
    return jsonError("Card not found", 404);
  }
  const comments = await prisma.comment.findMany({
    where: { cardId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(
    { comments: toCommentDTOs(comments) },
    { headers: { "Content-Type": "application/json" } },
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ cardId: string }> },
) {
  const { cardId } = await context.params;
  const body = await readJsonBody<{ text?: unknown; author?: unknown }>(request);
  if (body === null) {
    return jsonError("Invalid JSON body", 400);
  }

  const card = await findCard(cardId);
  if (!card) {
    return jsonError("Card not found", 404);
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return jsonError("text is required", 400);
  }

  let author: string | null = null;
  if (body.author !== undefined && body.author !== null) {
    if (typeof body.author !== "string") {
      return jsonError("author must be a string or null", 400);
    }
    const trimmed = body.author.trim();
    author = trimmed || null;
  }

  const comment = await prisma.comment.create({
    data: { cardId, text, author },
  });
  await recordActivity({
    boardId: card.list.boardId,
    type: "comment.created",
    summary: `Comment on ${quoteCardTitle(card.title)}: ${truncateForSummary(text)}`,
    actor: author,
    cardId,
  });
  return NextResponse.json(toCommentDTO(comment), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
