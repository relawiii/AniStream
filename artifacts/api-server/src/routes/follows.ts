import { Router } from "express";
import { db, followsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { FollowAnimeBody, UnfollowAnimeParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const follows = await db.select().from(followsTable).orderBy(followsTable.createdAt);
  res.json(follows);
});

router.post("/", async (req, res) => {
  const parsed = FollowAnimeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const existing = await db.select().from(followsTable).where(eq(followsTable.animeId, parsed.data.animeId));
  if (existing.length > 0) {
    res.status(201).json(existing[0]);
    return;
  }

  const [follow] = await db.insert(followsTable).values({
    animeId: parsed.data.animeId,
    animeTitle: parsed.data.animeTitle,
    animeCoverImage: parsed.data.animeCoverImage ?? null,
    notifyBeforeMinutes: parsed.data.notifyBeforeMinutes ?? 10,
  }).returning();

  res.status(201).json(follow);
});

router.delete("/:animeId", async (req, res) => {
  const parsed = UnfollowAnimeParams.safeParse({ animeId: Number(req.params.animeId) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid anime ID" });
    return;
  }

  await db.delete(followsTable).where(eq(followsTable.animeId, parsed.data.animeId));
  res.status(204).send();
});

export default router;
