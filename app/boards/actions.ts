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

  const workspaceId = await getDefaultWorkspaceId();
  const board = await prisma.board.create({ data: { title, workspaceId } });
  revalidatePath("/boards");
  redirect(`/boards/${board.id}`);
}
