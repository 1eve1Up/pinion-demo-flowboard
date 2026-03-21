import { NextResponse } from "next/server";

export function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Content-Type": "application/json" } },
  );
}

export async function readJsonBody<T = unknown>(request: Request): Promise<T | null> {
  try {
    const text = await request.text();
    if (!text.trim()) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
