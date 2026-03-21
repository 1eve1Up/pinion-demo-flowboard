import type { Board, Card, List } from "@prisma/client";

export type CardDTO = {
  id: string;
  listId: string;
  title: string;
  description: string;
  position: number;
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
  title: string;
  createdAt: string;
};

export type BoardDetailDTO = BoardDTO & { lists: ListDTO[] };

export function toCardDTO(c: Card): CardDTO {
  return {
    id: c.id,
    listId: c.listId,
    title: c.title,
    description: c.description,
    position: c.position,
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
    title: b.title,
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
