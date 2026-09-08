import { describe, expect, it } from "vitest";

import { toCommentDTO, toCommentDTOs } from "@/lib/serialize";

describe("comment DTOs", () => {
  it("toCommentDTO uses camelCase and nullable author", () => {
    expect(
      toCommentDTO({
        id: "cm1",
        cardId: "c1",
        text: "Shipped fix",
        author: "agent",
        createdAt: new Date("2026-01-03T12:00:00.000Z"),
      }),
    ).toEqual({
      id: "cm1",
      cardId: "c1",
      text: "Shipped fix",
      author: "agent",
      createdAt: "2026-01-03T12:00:00.000Z",
    });
    expect(
      toCommentDTO({
        id: "cm2",
        cardId: "c1",
        text: "Note",
        author: null,
        createdAt: new Date("2026-01-04T12:00:00.000Z"),
      }).author,
    ).toBeNull();
  });

  it("toCommentDTOs sorts oldest first", () => {
    const dtos = toCommentDTOs([
      {
        id: "cm2",
        cardId: "c1",
        text: "Second",
        author: null,
        createdAt: new Date("2026-01-02T00:00:00.000Z"),
      },
      {
        id: "cm1",
        cardId: "c1",
        text: "First",
        author: null,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]);
    expect(dtos.map((d) => d.text)).toEqual(["First", "Second"]);
  });
});
