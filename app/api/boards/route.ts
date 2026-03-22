import { NextResponse } from "next/server";

import { getDefaultWorkspaceId } from "@/lib/default-workspace";
import { jsonError, readJsonBody } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { toBoardDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export async function GET() {
  const boards = await prisma.board.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(
    { boards: boards.map(toBoardDTO) },
    { headers: { "Content-Type": "application/json" } },
  );
}

export async function POST(request: Request) {
  const body = await readJsonBody<{ title?: unknown }>(request);
  if (body === null) {
    return jsonError("Invalid JSON body", 400);
  }
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return jsonError("title is required", 400);
  }
  const workspaceId = await getDefaultWorkspaceId();
  const board = await prisma.board.create({ data: { title, workspaceId } });
  return NextResponse.json(toBoardDTO(board), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
