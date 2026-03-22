import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { GET as getBoard, DELETE as deleteBoard } from "@/app/api/boards/[boardId]/route";
import { GET as listBoards, POST as createBoard } from "@/app/api/boards/route";
import { PATCH as patchCard } from "@/app/api/cards/[cardId]/route";
import { POST as createCardRoot } from "@/app/api/cards/route";
import { PATCH as patchList, DELETE as deleteList } from "@/app/api/lists/[listId]/route";
import { POST as createList } from "@/app/api/lists/route";
import { GET as getWorkspace } from "@/app/api/workspaces/[workspaceId]/route";
import {
  GET as listWorkspaces,
  POST as createWorkspace,
} from "@/app/api/workspaces/route";
import { prisma } from "@/lib/prisma";

async function readJson<T>(res: Response): Promise<T> {
  return res.json() as Promise<T>;
}

beforeEach(async () => {
  await prisma.card.deleteMany();
  await prisma.list.deleteMany();
  await prisma.board.deleteMany();
  await prisma.workspace.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("FlowBoard REST API", () => {
  it("workspaces: list, POST, GET detail, 404 for unknown id", async () => {
    const empty = await listWorkspaces();
    expect(empty.status).toBe(200);
    expect((await readJson<{ workspaces: unknown[] }>(empty)).workspaces).toEqual(
      [],
    );

    const post = await createWorkspace(
      new Request("http://localhost/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "  Team A  " }),
      }),
    );
    expect(post.status).toBe(201);
    const created = await readJson<{ id: string; name: string }>(post);
    expect(created.name).toBe("Team A");

    const listed = await readJson<{ workspaces: { id: string }[] }>(
      await listWorkspaces(),
    );
    expect(listed.workspaces).toHaveLength(1);
    expect(listed.workspaces[0].id).toBe(created.id);

    const detail = await getWorkspace(
      new Request("http://localhost"),
      { params: Promise.resolve({ workspaceId: created.id }) },
    );
    expect(detail.status).toBe(200);
    const body = await readJson<{ boards: unknown[]; name: string }>(detail);
    expect(body.name).toBe("Team A");
    expect(body.boards).toEqual([]);

    const missing = await getWorkspace(
      new Request("http://localhost"),
      { params: Promise.resolve({ workspaceId: "missing-ws" }) },
    );
    expect(missing.status).toBe(404);
  });

  it("rejects invalid JSON on POST workspace", async () => {
    const res = await createWorkspace(
      new Request("http://localhost/api/workspaces", {
        method: "POST",
        body: "{",
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(res.status).toBe(400);
  });

  it("creates board, lists boards, gets board detail", async () => {
    const post = await createBoard(
      new Request("http://localhost/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "  Sprint  " }),
      }),
    );
    expect(post.status).toBe(201);
    const created = await readJson<{ id: string; title: string }>(post);
    expect(created.title).toBe("Sprint");

    const listRes = await listBoards();
    expect(listRes.status).toBe(200);
    const listBody = await readJson<{ boards: { id: string }[] }>(listRes);
    expect(listBody.boards).toHaveLength(1);

    const getRes = await getBoard(
      new Request("http://localhost/api/boards/x"),
      { params: Promise.resolve({ boardId: created.id }) },
    );
    expect(getRes.status).toBe(200);
    const detail = await readJson<{ lists: unknown[] }>(getRes);
    expect(detail.lists).toEqual([]);
  });

  it("rejects invalid JSON on POST board", async () => {
    const res = await createBoard(
      new Request("http://localhost/api/boards", {
        method: "POST",
        body: "{",
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(res.status).toBe(400);
    const body = await readJson<{ error: string }>(res);
    expect(body.error).toBeTruthy();
  });

  it("CRUD lists and cards; move card within board; rejects cross-board listId", async () => {
    const b1 = await readJson<{ id: string }>(
      await createBoard(
        new Request("http://localhost/api/boards", {
          method: "POST",
          body: JSON.stringify({ title: "B1" }),
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    const b2 = await readJson<{ id: string }>(
      await createBoard(
        new Request("http://localhost/api/boards", {
          method: "POST",
          body: JSON.stringify({ title: "B2" }),
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const l1 = await readJson<{ id: string }>(
      await createList(
        new Request("http://localhost/api/lists", {
          method: "POST",
          body: JSON.stringify({ boardId: b1.id, title: "Todo" }),
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    const l2 = await readJson<{ id: string }>(
      await createList(
        new Request("http://localhost/api/lists", {
          method: "POST",
          body: JSON.stringify({ boardId: b1.id, title: "Done" }),
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    const otherBoardList = await readJson<{ id: string }>(
      await createList(
        new Request("http://localhost/api/lists", {
          method: "POST",
          body: JSON.stringify({ boardId: b2.id, title: "Other" }),
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const cardRes = await createCardRoot(
      new Request("http://localhost/api/cards", {
        method: "POST",
        body: JSON.stringify({
          listId: l1.id,
          title: "Task",
          description: "desc",
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(cardRes.status).toBe(201);
    const card = await readJson<{ id: string; listId: string }>(cardRes);

    const titlePatch = await patchCard(
      new Request("http://localhost/api/cards/x", {
        method: "PATCH",
        body: JSON.stringify({ title: "Renamed" }),
        headers: { "Content-Type": "application/json" },
      }),
      { params: Promise.resolve({ cardId: card.id }) },
    );
    expect(titlePatch.status).toBe(200);
    expect((await readJson<{ title: string }>(titlePatch)).title).toBe("Renamed");

    const badMove = await patchCard(
      new Request("http://localhost/api/cards/x", {
        method: "PATCH",
        body: JSON.stringify({ listId: otherBoardList.id, position: 0 }),
        headers: { "Content-Type": "application/json" },
      }),
      { params: Promise.resolve({ cardId: card.id }) },
    );
    expect(badMove.status).toBe(400);
    const badBody = await readJson<{ error: string }>(badMove);
    expect(badBody.error).toMatch(/same board/i);

    const goodMove = await patchCard(
      new Request("http://localhost/api/cards/x", {
        method: "PATCH",
        body: JSON.stringify({ listId: l2.id, position: 2 }),
        headers: { "Content-Type": "application/json" },
      }),
      { params: Promise.resolve({ cardId: card.id }) },
    );
    expect(goodMove.status).toBe(200);
    const moved = await readJson<{ listId: string; position: number }>(goodMove);
    expect(moved.listId).toBe(l2.id);
    expect(moved.position).toBe(2);

    const boardJson = await readJson<{
      lists: { id: string; cards: { id: string }[] }[];
    }>(
      await getBoard(
        new Request("http://localhost"),
        { params: Promise.resolve({ boardId: b1.id }) },
      ),
    );
    const done = boardJson.lists.find((x) => x.id === l2.id);
    const todo = boardJson.lists.find((x) => x.id === l1.id);
    expect(done?.cards.some((c) => c.id === card.id)).toBe(true);
    expect(todo?.cards.some((c) => c.id === card.id)).toBe(false);

    const delList = await deleteList(
      new Request("http://localhost"),
      { params: Promise.resolve({ listId: l1.id }) },
    );
    expect(delList.status).toBe(204);

    const delBoard = await deleteBoard(
      new Request("http://localhost"),
      { params: Promise.resolve({ boardId: b1.id }) },
    );
    expect(delBoard.status).toBe(204);

    const remaining = await readJson<{ boards: unknown[] }>(await listBoards());
    expect(remaining.boards).toHaveLength(1);
  });

  it("returns 404 for missing resources", async () => {
    const g = await getBoard(
      new Request("http://localhost"),
      { params: Promise.resolve({ boardId: "missing" }) },
    );
    expect(g.status).toBe(404);

    const p = await patchList(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ title: "x" }),
        headers: { "Content-Type": "application/json" },
      }),
      { params: Promise.resolve({ listId: "missing" }) },
    );
    expect(p.status).toBe(404);
  });
});

/**
 * PIN-008 — isolated DB via `DATABASE_URL=file:./prisma/test-integration.db` (see npm `pretest` / `test`).
 * Fails if move stops persisting or cross-board moves corrupt data.
 */
describe("Sprint path regression (PIN-008)", () => {
  it("full API path: board → lists → card → move; GET and Prisma match", async () => {
    const board = await readJson<{ id: string }>(
      await createBoard(
        new Request("http://localhost/api/boards", {
          method: "POST",
          body: JSON.stringify({ title: "Regression board" }),
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    const colA = await readJson<{ id: string }>(
      await createList(
        new Request("http://localhost/api/lists", {
          method: "POST",
          body: JSON.stringify({ boardId: board.id, title: "A" }),
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    const colB = await readJson<{ id: string }>(
      await createList(
        new Request("http://localhost/api/lists", {
          method: "POST",
          body: JSON.stringify({ boardId: board.id, title: "B" }),
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    const card = await readJson<{ id: string }>(
      await createCardRoot(
        new Request("http://localhost/api/cards", {
          method: "POST",
          body: JSON.stringify({ listId: colA.id, title: "Item" }),
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const move = await patchCard(
      new Request("http://localhost/api/cards/x", {
        method: "PATCH",
        body: JSON.stringify({ listId: colB.id, position: 0 }),
        headers: { "Content-Type": "application/json" },
      }),
      { params: Promise.resolve({ cardId: card.id }) },
    );
    expect(move.status).toBe(200);

    const row = await prisma.card.findUnique({ where: { id: card.id } });
    expect(row?.listId).toBe(colB.id);
    expect(row?.position).toBe(0);

    const detail = await readJson<{
      lists: { id: string; cards: { id: string }[] }[];
    }>(
      await getBoard(
        new Request("http://localhost"),
        { params: Promise.resolve({ boardId: board.id }) },
      ),
    );
    const listA = detail.lists.find((l) => l.id === colA.id);
    const listB = detail.lists.find((l) => l.id === colB.id);
    expect(listA?.cards.some((c) => c.id === card.id)).toBe(false);
    expect(listB?.cards.some((c) => c.id === card.id)).toBe(true);
  });

  it("rejected cross-board move does not change stored listId", async () => {
    const home = await readJson<{ id: string }>(
      await createBoard(
        new Request("http://localhost/api/boards", {
          method: "POST",
          body: JSON.stringify({ title: "Home" }),
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    const away = await readJson<{ id: string }>(
      await createBoard(
        new Request("http://localhost/api/boards", {
          method: "POST",
          body: JSON.stringify({ title: "Away" }),
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    const homeList = await readJson<{ id: string }>(
      await createList(
        new Request("http://localhost/api/lists", {
          method: "POST",
          body: JSON.stringify({ boardId: home.id, title: "In" }),
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    const awayList = await readJson<{ id: string }>(
      await createList(
        new Request("http://localhost/api/lists", {
          method: "POST",
          body: JSON.stringify({ boardId: away.id, title: "Out" }),
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    const card = await readJson<{ id: string }>(
      await createCardRoot(
        new Request("http://localhost/api/cards", {
          method: "POST",
          body: JSON.stringify({ listId: homeList.id, title: "X" }),
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const res = await patchCard(
      new Request("http://localhost/api/cards/x", {
        method: "PATCH",
        body: JSON.stringify({ listId: awayList.id, position: 0 }),
        headers: { "Content-Type": "application/json" },
      }),
      { params: Promise.resolve({ cardId: card.id }) },
    );
    expect(res.status).toBe(400);

    const row = await prisma.card.findUnique({ where: { id: card.id } });
    expect(row?.listId).toBe(homeList.id);
  });
});
