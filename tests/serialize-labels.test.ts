import { describe, expect, it } from "vitest";

import { toCardDTO, toLabelDTO, toBoardDetailDTO } from "@/lib/serialize";

describe("label DTOs", () => {
  const baseLabel = {
    id: "lab1",
    boardId: "b1",
    name: "Bug",
    color: "#ff0000",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  it("toLabelDTO uses camelCase and nullable color", () => {
    expect(toLabelDTO(baseLabel)).toEqual({
      id: "lab1",
      boardId: "b1",
      name: "Bug",
      color: "#ff0000",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    expect(
      toLabelDTO({ ...baseLabel, color: null }).color,
    ).toBeNull();
  });

  it("toCardDTO includes labels from CardLabel join rows", () => {
    const card = {
      id: "c1",
      listId: "l1",
      title: "Fix",
      description: "",
      position: 0,
      archived: false,
      dueDate: null as Date | null,
      createdAt: new Date("2026-01-02T00:00:00.000Z"),
      labels: [{ label: baseLabel }],
    };
    const dto = toCardDTO(card);
    expect(dto.labels).toEqual([
      {
        id: "lab1",
        boardId: "b1",
        name: "Bug",
        color: "#ff0000",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
  });

  it("toCardDTO defaults labels to [] when relation omitted", () => {
    const dto = toCardDTO({
      id: "c1",
      listId: "l1",
      title: "Fix",
      description: "",
      position: 0,
      archived: false,
      dueDate: null,
      createdAt: new Date("2026-01-02T00:00:00.000Z"),
    });
    expect(dto.labels).toEqual([]);
  });

  it("toBoardDetailDTO includes board labels array", () => {
    const board = {
      id: "b1",
      workspaceId: "w1",
      title: "Board",
      description: "",
      visibility: "private" as const,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      lists: [],
      labels: [baseLabel],
    };
    const dto = toBoardDetailDTO(board);
    expect(dto.labels).toHaveLength(1);
    expect(dto.labels[0].name).toBe("Bug");
  });
});
