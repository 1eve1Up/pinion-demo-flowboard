import { NextResponse } from "next/server";

import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { toWorkspaceDetailDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ workspaceId: string }> },
) {
  const { workspaceId } = await context.params;
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      boards: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!workspace) {
    return jsonError("Workspace not found", 404);
  }
  return NextResponse.json(toWorkspaceDetailDTO(workspace), {
    headers: { "Content-Type": "application/json" },
  });
}
