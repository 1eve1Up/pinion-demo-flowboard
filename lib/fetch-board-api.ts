import { headers } from "next/headers";

import type { BoardDetailDTO } from "@/lib/serialize";

export type FetchBoardDetailOptions = {
  /** When true, request `?includeArchived=true` so archived cards appear in each list. */
  includeArchived?: boolean;
};

/**
 * Server-only: load board (with lists + cards) via the public REST API (PIN-003).
 */
export async function fetchBoardDetailFromApi(
  boardId: string,
  options?: FetchBoardDetailOptions,
): Promise<BoardDetailDTO | null> {
  const h = await headers();
  const host =
    h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "development" ? "http" : "https");
  const q =
    options?.includeArchived === true ? "?includeArchived=true" : "";
  const url = `${proto}://${host}/api/boards/${boardId}${q}`;

  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`GET ${url} failed: ${res.status}`);
  }
  return res.json() as Promise<BoardDetailDTO>;
}
