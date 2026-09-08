import { NextResponse } from "next/server";

import { jsonError, readJsonBody } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { toLabelDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ boardId: string }> },
) {
  const { boardId } = await context.params;
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) {
    return jsonError("Board not found", 404);
  }
  const labels = await prisma.label.findMany({
    where: { boardId },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(
    { labels: labels.map(toLabelDTO) },
    { headers: { "Content-Type": "application/json" } },
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ boardId: string }> },
) {
  const { boardId } = await context.params;
  const body = await readJsonBody<{ name?: unknown; color?: unknown }>(request);
  if (body === null) {
    return jsonError("Invalid JSON body", 400);
  }

  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) {
    return jsonError("Board not found", 404);
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return jsonError("name is required", 400);
  }

  let color: string | null = null;
  if (body.color !== undefined && body.color !== null) {
    if (typeof body.color !== "string") {
      return jsonError("color must be a string or null", 400);
    }
    const trimmed = body.color.trim();
    color = trimmed || null;
  }

  const existing = await prisma.label.findUnique({
    where: { boardId_name: { boardId, name } },
  });
  if (existing) {
    return jsonError("A label with this name already exists on the board", 409);
  }

  const label = await prisma.label.create({
    data: { boardId, name, color },
  });
  return NextResponse.json(toLabelDTO(label), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
