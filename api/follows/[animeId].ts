import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, followsTable } from "../_db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const UpdateProgressBody = z.object({
  watchedEpisodes: z.number().int().min(0),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  const animeId = Number(req.query.animeId);
  if (isNaN(animeId)) return res.status(400).json({ error: "Invalid anime ID" });

  try {
    if (req.method === "PATCH") {
      const parsed = UpdateProgressBody.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid request body" });

      const [updated] = await db
        .update(followsTable)
        .set({ watchedEpisodes: parsed.data.watchedEpisodes })
        .where(eq(followsTable.animeId, animeId))
        .returning();

      if (!updated) return res.status(404).json({ error: "Follow not found" });
      return res.json(updated);
    }

    if (req.method === "DELETE") {
      await db.delete(followsTable).where(eq(followsTable.animeId, animeId));
      return res.status(204).end();
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
