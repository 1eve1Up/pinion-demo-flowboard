"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export async function createBoard(formData: FormData) {
  const title = formData.get("title")?.toString().trim();
  if (!title) {
    redirect("/boards?error=missing-title");
  }

  const board = await prisma.board.create({ data: { title } });
  revalidatePath("/boards");
  redirect(`/boards/${board.id}`);
}
