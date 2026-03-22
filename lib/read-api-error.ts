/**
 * Best-effort user-visible message from a failed JSON API response body.
 */
export async function readApiErrorMessage(
  res: Response,
  fallback: string,
): Promise<string> {
  const body = (await res.json().catch(() => ({}))) as { error?: unknown };
  const e = body.error;
  if (typeof e === "string" && e.trim()) {
    return e.trim();
  }
  return fallback;
}
