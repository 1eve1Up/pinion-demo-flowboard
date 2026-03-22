import { NextResponse } from "next/server";

import { getDefaultWorkspaceId } from "@/lib/default-workspace";
import { jsonError, readJsonBody } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { toBoardDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

/**
 * Board list:
 * - GET with optional query `workspaceId`: returns only boards in that workspace.
 * - GET without query: returns all boards (backwards compatible for UI/tests).
 * - POST body: `title` (required), optional `workspaceId` (must exist). Omitted → default workspace (see getDefaultWorkspaceId).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId")?.trim() || null;

  const boards = await prisma.board.findMany({
    where: workspaceId ? { workspaceId } : undefined,
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(
    { boards: boards.map(toBoardDTO) },
    { headers: { "Content-Type": "application/json" } },
  );
}

export async function POST(request: Request) {
  const body = await readJsonBody<{
    title?: unknown;
    workspaceId?: unknown;
  }>(request);
  if (body === null) {
    return jsonError("Invalid JSON body", 400);
  }
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return jsonError("title is required", 400);
  }

  let workspaceId: string;
  const rawWs =
    typeof body.workspaceId === "string" ? body.workspaceId.trim() : "";
  if (rawWs) {
    const ws = await prisma.workspace.findUnique({ where: { id: rawWs } });
    if (!ws) {
      return jsonError("Workspace not found", 404);
    }
    workspaceId = ws.id;
  } else {
    workspaceId = await getDefaultWorkspaceId();
  }

  const board = await prisma.board.create({ data: { title, workspaceId } });
  return NextResponse.json(toBoardDTO(board), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
