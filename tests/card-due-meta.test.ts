import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { cardDueMeta } from "@/lib/card-due-meta";

const prevTz = process.env.TZ;

describe("cardDueMeta", () => {
  beforeAll(() => {
    process.env.TZ = "UTC";
  });

  afterAll(() => {
    process.env.TZ = prevTz;
  });

  it("returns null for null or invalid iso", () => {
    expect(cardDueMeta(null)).toBeNull();
    expect(cardDueMeta("")).toBeNull();
    expect(cardDueMeta("not-a-date")).toBeNull();
  });

  it("classifies same calendar day as today (PIN-029 chip copy)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T15:00:00.000Z"));
    const meta = cardDueMeta("2025-06-15T08:30:00.000Z");
    expect(meta?.tone).toBe("today");
    expect(meta?.label).toMatch(/^Today/);
    vi.useRealTimers();
  });

  it("classifies previous calendar day as overdue with Yesterday label", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00.000Z"));
    const meta = cardDueMeta("2025-06-14T12:00:00.000Z");
    expect(meta?.tone).toBe("overdue");
    expect(meta?.label).toMatch(/^Yesterday/);
    vi.useRealTimers();
  });

  it("classifies next calendar day as soon / Tomorrow", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00.000Z"));
    const meta = cardDueMeta("2025-06-16T00:00:00.000Z");
    expect(meta?.tone).toBe("soon");
    expect(meta?.label).toMatch(/^Tomorrow/);
    vi.useRealTimers();
  });
});
