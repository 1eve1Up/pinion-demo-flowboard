import { prisma } from "@/lib/prisma";

/** Id inserted by migration `20260322002417_workspace_board_card_metadata` for backfill. */
export const MIGRATION_DEFAULT_WORKSPACE_ID = "ws_default_sprint2";

/**
 * Workspace to attach new boards to when the client does not specify one (until workspace APIs land).
 */
export async function getDefaultWorkspaceId(): Promise<string> {
  const migrated = await prisma.workspace.findUnique({
    where: { id: MIGRATION_DEFAULT_WORKSPACE_ID },
  });
  if (migrated) return migrated.id;

  const first = await prisma.workspace.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (first) return first.id;

  const created = await prisma.workspace.create({ data: { name: "Default" } });
  return created.id;
}
