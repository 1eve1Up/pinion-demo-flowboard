import type {
  ActivityEntry,
  Board,
  BoardVisibility,
  Card,
  Comment,
  Label,
  List,
  Workspace,
} from "@prisma/client";

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

export type LabelDTO = {
  id: string;
  boardId: string;
  name: string;
  color: string | null;
  createdAt: string;
};

export type CommentDTO = {
  id: string;
  cardId: string;
  text: string;
  author: string | null;
  createdAt: string;
};

export type ActivityEntryDTO = {
  id: string;
  boardId: string;
  type: string;
  summary: string;
  actor: string | null;
  cardId: string | null;
  metadata: string | null;
  createdAt: string;
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
  labels: LabelDTO[];
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

export type BoardDetailDTO = BoardDTO & {
  lists: ListDTO[];
  labels: LabelDTO[];
};

type LabelRow = Label;

type CardWithLabels = Card & {
  labels?: { label: LabelRow }[] | LabelRow[];
};

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

export function toLabelDTO(l: LabelRow): LabelDTO {
  return {
    id: l.id,
    boardId: l.boardId,
    name: l.name,
    color: l.color ?? null,
    createdAt: l.createdAt.toISOString(),
  };
}

export function toCommentDTO(c: Comment): CommentDTO {
  return {
    id: c.id,
    cardId: c.cardId,
    text: c.text,
    author: c.author ?? null,
    createdAt: c.createdAt.toISOString(),
  };
}

export function toCommentDTOs(comments: Comment[]): CommentDTO[] {
  return comments
    .slice()
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map(toCommentDTO);
}

export function toActivityEntryDTO(e: ActivityEntry): ActivityEntryDTO {
  return {
    id: e.id,
    boardId: e.boardId,
    type: e.type,
    summary: e.summary,
    actor: e.actor ?? null,
    cardId: e.cardId ?? null,
    metadata: e.metadata ?? null,
    createdAt: e.createdAt.toISOString(),
  };
}

export function toActivityEntryDTOs(entries: ActivityEntry[]): ActivityEntryDTO[] {
  return entries
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map(toActivityEntryDTO);
}

function labelsFromCard(c: CardWithLabels): LabelDTO[] {
  const raw = c.labels;
  if (!raw || raw.length === 0) return [];
  return raw.map((row) => {
    if ("label" in row && row.label) {
      return toLabelDTO(row.label);
    }
    return toLabelDTO(row as LabelRow);
  });
}

export function toCardDTO(c: CardWithLabels): CardDTO {
  return {
    id: c.id,
    listId: c.listId,
    title: c.title,
    description: c.description,
    position: c.position,
    archived: c.archived,
    dueDate: c.dueDate ? c.dueDate.toISOString() : null,
    createdAt: c.createdAt.toISOString(),
    labels: labelsFromCard(c),
  };
}

export function toListDTO(
  l: List & { cards: CardWithLabels[] },
): ListDTO {
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
  b: Board & {
    lists: (List & { cards: CardWithLabels[] })[];
    labels?: LabelRow[];
  },
): BoardDetailDTO {
  return {
    ...toBoardDTO(b),
    lists: b.lists.map(toListDTO),
    labels: (b.labels ?? []).map(toLabelDTO),
  };
}
