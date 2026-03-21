import { NextResponse } from "next/server";

import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { toBoardDetailDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ boardId: string }> },
) {
  const { boardId } = await context.params;
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      lists: {
        orderBy: { position: "asc" },
        include: { cards: { orderBy: { position: "asc" } } },
      },
    },
  });
  if (!board) {
    return jsonError("Board not found", 404);
  }
  return NextResponse.json(toBoardDetailDTO(board), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ boardId: string }> },
) {
  const { boardId } = await context.params;
  const found = await prisma.board.findUnique({ where: { id: boardId } });
  if (!found) {
    return jsonError("Board not found", 404);
  }
  await prisma.board.delete({ where: { id: boardId } });
  return new NextResponse(null, { status: 204 });
}
