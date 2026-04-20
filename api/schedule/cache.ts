import { db, scheduleCacheTable } from "../_db";
import { eq } from "drizzle-orm";

export default async function handler(req: any, res: any) {
  try {
    // GET /api/schedule/cache
    if (req.method === "GET") {
      const cache = await db
        .select()
        .from(scheduleCacheTable)
        .orderBy(scheduleCacheTable.animeId);
      return res.json(cache);
    }

    // POST /api/schedule/cache — upsert a cache entry
    if (req.method === "POST") {
      const { animeId, episodeNumber, airingAt } = req.body ?? {};

      if (!animeId || !episodeNumber || !airingAt) {
        return res.status(400).json({ error: "Invalid request body" });
      }

      const existing = await db
        .select()
        .from(scheduleCacheTable)
        .where(eq(scheduleCacheTable.animeId, Number(animeId)));

      let wasDelayed = false;
      if (existing.length > 0) {
        const prev = existing[0];
        if (
          prev.episodeNumber === Number(episodeNumber) &&
          prev.airingAt !== Number(airingAt)
        ) {
          wasDelayed = true;
        }
      }

      const [entry] = await db
        .insert(scheduleCacheTable)
        .values({
          animeId: Number(animeId),
          episodeNumber: Number(episodeNumber),
          airingAt: Number(airingAt),
          wasDelayed,
        })
        .onConflictDoUpdate({
          target: scheduleCacheTable.animeId,
          set: {
            episodeNumber: Number(episodeNumber),
            airingAt: Number(airingAt),
            detectedAt: new Date(),
            wasDelayed,
          },
        })
        .returning();

      return res.json(entry);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[schedule/cache]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
