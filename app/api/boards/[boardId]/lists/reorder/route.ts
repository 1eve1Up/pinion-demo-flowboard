import { NextResponse } from "next/server";

import { jsonError, readJsonBody } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { toListDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

/**
 * Column reorder: body `{ listIds: string[] }` is the new left-to-right order.
 * Assigns dense integer positions 0..n-1. Requires every list on the board exactly once (no duplicates, no omissions).
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ boardId: string }> },
) {
  const { boardId } = await context.params;
  const body = await readJsonBody<{ listIds?: unknown }>(request);
  if (body === null) {
    return jsonError("Invalid JSON body", 400);
  }
  if (!Array.isArray(body.listIds)) {
    return jsonError("listIds must be an array", 400);
  }
  const listIds = body.listIds.filter(
    (x): x is string => typeof x === "string" && x.trim().length > 0,
  );
  if (listIds.length !== body.listIds.length) {
    return jsonError("listIds must be non-empty strings", 400);
  }
  if (new Set(listIds).size !== listIds.length) {
    return jsonError("listIds must not contain duplicates", 400);
  }

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      lists: { select: { id: true } },
    },
  });
  if (!board) {
    return jsonError("Board not found", 404);
  }

  const onBoard = new Set(board.lists.map((l) => l.id));
  if (listIds.length !== onBoard.size) {
    return jsonError(
      "listIds must include every list on this board exactly once",
      400,
    );
  }
  for (const id of listIds) {
    if (!onBoard.has(id)) {
      return jsonError("list id does not belong to this board", 400);
    }
  }

  const updated = await prisma.$transaction(
    listIds.map((id, position) =>
      prisma.list.update({
        where: { id },
        data: { position },
        include: { cards: { orderBy: { position: "asc" } } },
      }),
    ),
  );

  return NextResponse.json(
    { lists: updated.map(toListDTO) },
    { headers: { "Content-Type": "application/json" } },
  );
}
