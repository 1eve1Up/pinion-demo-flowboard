import type { Board, BoardVisibility, Card, List, Workspace } from "@prisma/client";

/** Workspace summary for GET /api/workspaces and POST responses. */
export type WorkspaceDTO = {
  id: string;
  name: string;
  createdAt: string;
};

/** Workspace with boards for GET /api/workspaces/[id] (no nested lists/cards). */
export type WorkspaceDetailDTO = WorkspaceDTO & {
  boards: BoardDTO[];
};

export type CardDTO = {
  id: string;
  listId: string;
  title: string;
  description: string;
  position: number;
  archived: boolean;
  dueDate: string | null;
  createdAt: string;
};

export type ListDTO = {
  id: string;
  boardId: string;
  title: string;
  position: number;
  createdAt: string;
  cards: CardDTO[];
};

export type BoardDTO = {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  visibility: BoardVisibility;
  createdAt: string;
};

export type BoardDetailDTO = BoardDTO & { lists: ListDTO[] };

export function toWorkspaceDTO(w: Workspace): WorkspaceDTO {
  return {
    id: w.id,
    name: w.name,
    createdAt: w.createdAt.toISOString(),
  };
}

export function toWorkspaceDetailDTO(
  w: Workspace & { boards: Board[] },
): WorkspaceDetailDTO {
  return {
    ...toWorkspaceDTO(w),
    boards: w.boards.map(toBoardDTO),
  };
}

export function toCardDTO(c: Card): CardDTO {
  return {
    id: c.id,
    listId: c.listId,
    title: c.title,
    description: c.description,
    position: c.position,
    archived: c.archived,
    dueDate: c.dueDate ? c.dueDate.toISOString() : null,
    createdAt: c.createdAt.toISOString(),
  };
}

export function toListDTO(l: List & { cards: Card[] }): ListDTO {
  return {
    id: l.id,
    boardId: l.boardId,
    title: l.title,
    position: l.position,
    createdAt: l.createdAt.toISOString(),
    cards: l.cards.map(toCardDTO),
  };
}

export function toBoardDTO(b: Board): BoardDTO {
  return {
    id: b.id,
    workspaceId: b.workspaceId,
    title: b.title,
    description: b.description,
    visibility: b.visibility,
    createdAt: b.createdAt.toISOString(),
  };
}

export function toBoardDetailDTO(
  b: Board & { lists: (List & { cards: Card[] })[] },
): BoardDetailDTO {
  return {
    ...toBoardDTO(b),
    lists: b.lists.map(toListDTO),
  };
}
