"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDefaultWorkspaceId } from "@/lib/default-workspace";
import { prisma } from "@/lib/prisma";

export async function createBoard(formData: FormData) {
  const title = formData.get("title")?.toString().trim();
  if (!title) {
    redirect("/boards?error=missing-title");
  }

  const rawWs = formData.get("workspaceId")?.toString().trim();
  let workspaceId: string;
  if (rawWs) {
    const ws = await prisma.workspace.findUnique({ where: { id: rawWs } });
    if (!ws) {
      redirect("/boards?error=missing-workspace");
    }
    workspaceId = ws.id;
  } else {
    workspaceId = await getDefaultWorkspaceId();
  }

  const board = await prisma.board.create({ data: { title, workspaceId } });
  revalidatePath("/boards");
  redirect(`/boards/${board.id}`);
}

export async function createWorkspace(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const finalName = name && name.length > 0 ? name : "New workspace";
  const ws = await prisma.workspace.create({ data: { name: finalName } });
  revalidatePath("/boards");
  redirect(`/boards?workspaceId=${encodeURIComponent(ws.id)}`);
}
