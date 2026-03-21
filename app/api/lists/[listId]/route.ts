import { NextResponse } from "next/server";

import { jsonError, readJsonBody } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { toListDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ listId: string }> },
) {
  const { listId } = await context.params;
  const body = await readJsonBody<{
    title?: unknown;
    position?: unknown;
  }>(request);
  if (body === null) {
    return jsonError("Invalid JSON body", 400);
  }

  const existing = await prisma.list.findUnique({
    where: { id: listId },
    include: { cards: { orderBy: { position: "asc" } } },
  });
  if (!existing) {
    return jsonError("List not found", 404);
  }

  const data: { title?: string; position?: number } = {};
  if (body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim()) {
      return jsonError("title must be a non-empty string", 400);
    }
    data.title = body.title.trim();
  }
  if (body.position !== undefined) {
    if (typeof body.position !== "number" || !Number.isInteger(body.position)) {
      return jsonError("position must be an integer", 400);
    }
    data.position = body.position;
  }
  if (Object.keys(data).length === 0) {
    return jsonError("No valid fields to update", 400);
  }

  const list = await prisma.list.update({
    where: { id: listId },
    data,
    include: { cards: { orderBy: { position: "asc" } } },
  });
  return NextResponse.json(toListDTO(list), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ listId: string }> },
) {
  const { listId } = await context.params;
  const found = await prisma.list.findUnique({ where: { id: listId } });
  if (!found) {
    return jsonError("List not found", 404);
  }
  await prisma.list.delete({ where: { id: listId } });
  return new NextResponse(null, { status: 204 });
}
