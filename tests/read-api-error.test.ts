import { describe, expect, it } from "vitest";

import { readApiErrorMessage } from "@/lib/read-api-error";

describe("readApiErrorMessage", () => {
  it("returns trimmed error string from JSON body", async () => {
    const res = new Response(JSON.stringify({ error: "  List not found  " }), {
      status: 404,
    });
    await expect(readApiErrorMessage(res, "fallback")).resolves.toBe(
      "List not found",
    );
  });

  it("uses fallback when body has no usable error", async () => {
    const res = new Response(JSON.stringify({}), { status: 500 });
    await expect(readApiErrorMessage(res, "Server error (500)")).resolves.toBe(
      "Server error (500)",
    );
  });

  it("uses fallback for invalid JSON", async () => {
    const res = new Response("not json", { status: 502 });
    await expect(readApiErrorMessage(res, "Bad gateway (502)")).resolves.toBe(
      "Bad gateway (502)",
    );
  });
});
