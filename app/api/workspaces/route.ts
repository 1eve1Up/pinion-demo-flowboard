import { NextResponse } from "next/server";

import { jsonError, readJsonBody } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { toWorkspaceDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export async function GET() {
  const workspaces = await prisma.workspace.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(
    { workspaces: workspaces.map(toWorkspaceDTO) },
    { headers: { "Content-Type": "application/json" } },
  );
}

export async function POST(request: Request) {
  const body = await readJsonBody<{ name?: unknown }>(request);
  if (body === null) {
    return jsonError("Invalid JSON body", 400);
  }
  const raw = typeof body.name === "string" ? body.name.trim() : "";
  const name = raw || "Default";

  const workspace = await prisma.workspace.create({ data: { name } });
  return NextResponse.json(toWorkspaceDTO(workspace), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
