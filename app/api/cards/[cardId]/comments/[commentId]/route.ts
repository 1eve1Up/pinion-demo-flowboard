import { NextResponse } from "next/server";

import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ cardId: string; commentId: string }> },
) {
  const { cardId, commentId } = await context.params;
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.cardId !== cardId) {
    return jsonError("Comment not found", 404);
  }
  await prisma.comment.delete({ where: { id: commentId } });
  return new NextResponse(null, { status: 204 });
}
