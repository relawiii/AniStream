import { Router } from "express";
import { db, followsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { FollowAnimeBody, UnfollowAnimeParams } from "@workspace/api-zod";
import { z } from "zod";

const router = Router();

const UpdateProgressBody = z.object({
  watchedEpisodes: z.number().int().min(0),
});

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

router.patch("/:animeId", async (req, res) => {
  const paramsParsed = UnfollowAnimeParams.safeParse({ animeId: Number(req.params.animeId) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid anime ID" });
    return;
  }

  const bodyParsed = UpdateProgressBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const [updated] = await db
    .update(followsTable)
    .set({ watchedEpisodes: bodyParsed.data.watchedEpisodes })
    .where(eq(followsTable.animeId, paramsParsed.data.animeId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Follow not found" });
    return;
  }

  res.json(updated);
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
