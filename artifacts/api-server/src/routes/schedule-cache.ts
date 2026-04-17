import { Router } from "express";
import { db, scheduleCacheTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpsertScheduleCacheBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const cache = await db.select().from(scheduleCacheTable).orderBy(scheduleCacheTable.animeId);
  res.json(cache);
});

router.post("/", async (req, res) => {
  const parsed = UpsertScheduleCacheBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const existing = await db.select().from(scheduleCacheTable).where(eq(scheduleCacheTable.animeId, parsed.data.animeId));

  let wasDelayed = false;
  if (existing.length > 0) {
    const prev = existing[0];
    if (
      prev.episodeNumber === parsed.data.episodeNumber &&
      prev.airingAt !== parsed.data.airingAt
    ) {
      wasDelayed = true;
    }
  }

  const [entry] = await db
    .insert(scheduleCacheTable)
    .values({
      animeId: parsed.data.animeId,
      episodeNumber: parsed.data.episodeNumber,
      airingAt: parsed.data.airingAt,
      wasDelayed,
    })
    .onConflictDoUpdate({
      target: scheduleCacheTable.animeId,
      set: {
        episodeNumber: parsed.data.episodeNumber,
        airingAt: parsed.data.airingAt,
        detectedAt: new Date(),
        wasDelayed,
      },
    })
    .returning();

  res.json(entry);
});

export default router;
