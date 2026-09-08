import type { BoardVisibility } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  filterBoardLists,
  parseBoardCardFilters,
} from "@/lib/board-filters";
import { jsonError, readJsonBody } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { toBoardDetailDTO, toBoardDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

function parseVisibility(value: unknown): BoardVisibility | "invalid" | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") return "invalid";
  if (value === "private" || value === "workspace" || value === "public") {
    return value;
  }
  return "invalid";
}

/** Query `includeArchived=true|1|yes` includes archived cards in each list; default omits them (still visible via PATCH card and optional flag). */
function includeArchivedFromRequest(request: Request): boolean {
  const raw = new URL(request.url).searchParams.get("includeArchived");
  if (raw == null) return false;
  const v = raw.toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

export async function GET(
  request: Request,
  context: { params: Promise<{ boardId: string }> },
) {
  const { boardId } = await context.params;
  const url = new URL(request.url);
  const includeArchived = includeArchivedFromRequest(request);
  const filters = parseBoardCardFilters(url.searchParams);

  if (filters.due && !["overdue", "today", "soon", "none"].includes(filters.due)) {
    return jsonError(
      "due must be one of: overdue, today, soon, none",
      400,
    );
  }

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      labels: { orderBy: { name: "asc" } },
      lists: {
        orderBy: { position: "asc" },
        include: {
          cards: {
            where: includeArchived ? undefined : { archived: false },
            orderBy: { position: "asc" },
            include: {
              labels: {
                include: { label: true },
                orderBy: { label: { name: "asc" } },
              },
            },
          },
        },
      },
    },
  });
  if (!board) {
    return jsonError("Board not found", 404);
  }
  const detail = toBoardDetailDTO(board);
  detail.lists = filterBoardLists(detail.lists, filters);
  return NextResponse.json(detail, {
    headers: { "Content-Type": "application/json" },
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ boardId: string }> },
) {
  const { boardId } = await context.params;
  const body = await readJsonBody<{
    title?: unknown;
    description?: unknown;
    visibility?: unknown;
  }>(request);
  if (body === null) {
    return jsonError("Invalid JSON body", 400);
  }

  const existing = await prisma.board.findUnique({ where: { id: boardId } });
  if (!existing) {
    return jsonError("Board not found", 404);
  }

  const data: {
    title?: string;
    description?: string;
    visibility?: BoardVisibility;
  } = {};

  if (body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim()) {
      return jsonError("title must be a non-empty string", 400);
    }
    data.title = body.title.trim();
  }
  if (body.description !== undefined) {
    if (typeof body.description !== "string") {
      return jsonError("description must be a string", 400);
    }
    data.description = body.description;
  }
  if (body.visibility !== undefined) {
    const v = parseVisibility(body.visibility);
    if (v === "invalid") {
      return jsonError(
        "visibility must be one of: private, workspace, public",
        400,
      );
    }
    data.visibility = v;
  }

  if (Object.keys(data).length === 0) {
    return jsonError("No valid fields to update", 400);
  }

  const board = await prisma.board.update({
    where: { id: boardId },
    data,
  });
  return NextResponse.json(toBoardDTO(board), {
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
