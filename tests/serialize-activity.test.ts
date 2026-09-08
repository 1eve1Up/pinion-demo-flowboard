import { describe, expect, it } from "vitest";

import { toActivityEntryDTO, toActivityEntryDTOs } from "@/lib/serialize";

describe("activity entry DTOs", () => {
  it("toActivityEntryDTO uses camelCase and nullable fields", () => {
    expect(
      toActivityEntryDTO({
        id: "ae1",
        boardId: "b1",
        type: "card.created",
        summary: 'Created card "Fix login"',
        actor: "agent",
        cardId: "c1",
        metadata: null,
        createdAt: new Date("2026-01-03T12:00:00.000Z"),
      }),
    ).toEqual({
      id: "ae1",
      boardId: "b1",
      type: "card.created",
      summary: 'Created card "Fix login"',
      actor: "agent",
      cardId: "c1",
      metadata: null,
      createdAt: "2026-01-03T12:00:00.000Z",
    });
    expect(
      toActivityEntryDTO({
        id: "ae2",
        boardId: "b1",
        type: "card.updated",
        summary: "Updated card",
        actor: null,
        cardId: null,
        metadata: '{"from":"todo"}',
        createdAt: new Date("2026-01-04T12:00:00.000Z"),
      }).actor,
    ).toBeNull();
  });

  it("toActivityEntryDTOs sorts newest first", () => {
    const dtos = toActivityEntryDTOs([
      {
        id: "ae1",
        boardId: "b1",
        type: "card.created",
        summary: "First",
        actor: null,
        cardId: "c1",
        metadata: null,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
      {
        id: "ae2",
        boardId: "b1",
        type: "comment.created",
        summary: "Second",
        actor: null,
        cardId: "c1",
        metadata: null,
        createdAt: new Date("2026-01-02T00:00:00.000Z"),
      },
    ]);
    expect(dtos.map((d) => d.summary)).toEqual(["Second", "First"]);
  });
});
