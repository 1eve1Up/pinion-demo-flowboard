import { NextResponse } from "next/server";

import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { toActivityEntryDTOs } from "@/lib/serialize";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function parseLimit(raw: string | null): number | "invalid" {
  if (raw == null || raw.trim() === "") return DEFAULT_LIMIT;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) return "invalid";
  return Math.min(n, MAX_LIMIT);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ boardId: string }> },
) {
  const { boardId } = await context.params;
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) {
    return jsonError("Board not found", 404);
  }

  const url = new URL(request.url);
  const limitResult = parseLimit(url.searchParams.get("limit"));
  if (limitResult === "invalid") {
    return jsonError("limit must be a positive integer", 400);
  }
  const limit = limitResult;

  const cursorId = url.searchParams.get("cursor")?.trim() || null;
  let cursorEntry: { createdAt: Date; id: string; boardId: string } | null =
    null;
  if (cursorId) {
    cursorEntry = await prisma.activityEntry.findUnique({
      where: { id: cursorId },
      select: { createdAt: true, id: true, boardId: true },
    });
    if (!cursorEntry || cursorEntry.boardId !== boardId) {
      return jsonError("Invalid cursor", 400);
    }
  }

  const entries = await prisma.activityEntry.findMany({
    where: {
      boardId,
      ...(cursorEntry
        ? {
            OR: [
              { createdAt: { lt: cursorEntry.createdAt } },
              {
                createdAt: cursorEntry.createdAt,
                id: { lt: cursorEntry.id },
              },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit,
  });

  const activities = toActivityEntryDTOs(entries);
  const nextCursor =
    entries.length === limit ? (activities[activities.length - 1]?.id ?? null) : null;

  return NextResponse.json(
    { activities, nextCursor },
    { headers: { "Content-Type": "application/json" } },
  );
}
