import { describe, expect, it } from "vitest";

import { filterBoardLists, parseBoardCardFilters } from "@/lib/board-filters";
import type { ListDTO } from "@/lib/serialize";

const lists: ListDTO[] = [
  {
    id: "l1",
    boardId: "b1",
    title: "Todo",
    position: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    cards: [
      {
        id: "c1",
        listId: "l1",
        title: "Alpha",
        description: "one",
        position: 0,
        archived: false,
        dueDate: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        labels: [
          {
            id: "lab1",
            boardId: "b1",
            name: "Bug",
            color: null,
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        ],
      },
      {
        id: "c2",
        listId: "l1",
        title: "Beta",
        description: "two",
        position: 1,
        archived: false,
        dueDate: "2099-01-01T00:00:00.000Z",
        createdAt: "2026-01-01T00:00:00.000Z",
        labels: [],
      },
    ],
  },
];

describe("board-filters", () => {
  it("parseBoardCardFilters reads label due keyword", () => {
    const f = parseBoardCardFilters(
      new URLSearchParams("label=Bug&due=none&keyword=alp"),
    );
    expect(f).toEqual({ label: "Bug", due: "none", keyword: "alp" });
  });

  it("filterBoardLists by label and keyword", () => {
    expect(
      filterBoardLists(lists, { label: "Bug" }).flatMap((l) =>
        l.cards.map((c) => c.id),
      ),
    ).toEqual(["c1"]);
    expect(
      filterBoardLists(lists, { keyword: "BETA" }).flatMap((l) =>
        l.cards.map((c) => c.id),
      ),
    ).toEqual(["c2"]);
    expect(
      filterBoardLists(lists, { due: "none" }).flatMap((l) =>
        l.cards.map((c) => c.id),
      ),
    ).toEqual(["c1"]);
  });
});
