import { NextResponse } from "next/server";

import { jsonError, readJsonBody } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { toListDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await readJsonBody<{
    boardId?: unknown;
    title?: unknown;
    position?: unknown;
  }>(request);
  if (body === null) {
    return jsonError("Invalid JSON body", 400);
  }
  const boardId = typeof body.boardId === "string" ? body.boardId.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!boardId || !title) {
    return jsonError("boardId and title are required", 400);
  }

  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) {
    return jsonError("Board not found", 404);
  }

  let position: number;
  if (typeof body.position === "number" && Number.isInteger(body.position)) {
    position = body.position;
  } else {
    const agg = await prisma.list.aggregate({
      where: { boardId },
      _max: { position: true },
    });
    position = (agg._max.position ?? -1) + 1;
  }

  const list = await prisma.list.create({
    data: { boardId, title, position },
    include: { cards: { orderBy: { position: "asc" } } },
  });

  return NextResponse.json(toListDTO(list), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
