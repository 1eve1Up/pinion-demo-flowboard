/**
 * PIN-002 smoke: insert Board → List → Card.
 * `npm run db:smoke` runs migrate deploy on the same DB first (default: file:./prisma/dev.db).
 */
import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./prisma/dev.db";
}

const prisma = new PrismaClient();

async function main() {
  const board = await prisma.board.create({ data: { title: "Smoke board" } });
  const list = await prisma.list.create({
    data: { boardId: board.id, title: "Todo", position: 0 },
  });
  const card = await prisma.card.create({
    data: {
      listId: list.id,
      title: "Smoke card",
      description: "",
      position: 0,
    },
  });
  const found = await prisma.board.findUnique({
    where: { id: board.id },
    include: { lists: { include: { cards: true } } },
  });
  if (!found || found.lists.length !== 1 || found.lists[0].cards.length !== 1) {
    throw new Error("Expected nested board → list → card");
  }
  if (found.lists[0].cards[0].id !== card.id) {
    throw new Error("Card mismatch");
  }
  await prisma.$disconnect();
  console.log("smoke-db: ok", { boardId: board.id, listId: list.id, cardId: card.id });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
