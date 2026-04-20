import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, scheduleCacheTable } from "../../_db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const UpsertScheduleCacheBody = z.object({
  animeId: z.number().int(),
  episodeNumber: z.number().int(),
  airingAt: z.number().int(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    if (req.method === "GET") {
      const cache = await db.select().from(scheduleCacheTable).orderBy(scheduleCacheTable.animeId);
      return res.json(cache);
    }

    if (req.method === "POST") {
      const parsed = UpsertScheduleCacheBody.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid request body" });

      const existing = await db.select().from(scheduleCacheTable).where(eq(scheduleCacheTable.animeId, parsed.data.animeId));

      let wasDelayed = false;
      if (existing.length > 0) {
        const prev = existing[0];
        if (prev.episodeNumber === parsed.data.episodeNumber && prev.airingAt !== parsed.data.airingAt) {
          wasDelayed = true;
        }
      }

      const [entry] = await db
        .insert(scheduleCacheTable)
        .values({ ...parsed.data, wasDelayed })
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

      return res.json(entry);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
