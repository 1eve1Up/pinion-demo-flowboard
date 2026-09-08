import { NextResponse } from "next/server";

import { jsonError, readJsonBody } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { toLabelDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ boardId: string; labelId: string }> },
) {
  const { boardId, labelId } = await context.params;
  const body = await readJsonBody<{ name?: unknown; color?: unknown }>(request);
  if (body === null) {
    return jsonError("Invalid JSON body", 400);
  }

  const existing = await prisma.label.findUnique({ where: { id: labelId } });
  if (!existing || existing.boardId !== boardId) {
    return jsonError("Label not found", 404);
  }

  const data: { name?: string; color?: string | null } = {};
  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return jsonError("name must be a non-empty string", 400);
    }
    data.name = body.name.trim();
  }
  if (body.color !== undefined) {
    if (body.color === null) {
      data.color = null;
    } else if (typeof body.color === "string") {
      const trimmed = body.color.trim();
      data.color = trimmed || null;
    } else {
      return jsonError("color must be a string or null", 400);
    }
  }
  if (Object.keys(data).length === 0) {
    return jsonError("No valid fields to update", 400);
  }

  if (data.name && data.name !== existing.name) {
    const clash = await prisma.label.findUnique({
      where: { boardId_name: { boardId, name: data.name } },
    });
    if (clash) {
      return jsonError("A label with this name already exists on the board", 409);
    }
  }

  const label = await prisma.label.update({
    where: { id: labelId },
    data,
  });
  return NextResponse.json(toLabelDTO(label), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ boardId: string; labelId: string }> },
) {
  const { boardId, labelId } = await context.params;
  const existing = await prisma.label.findUnique({ where: { id: labelId } });
  if (!existing || existing.boardId !== boardId) {
    return jsonError("Label not found", 404);
  }
  await prisma.label.delete({ where: { id: labelId } });
  return new NextResponse(null, { status: 204 });
}
