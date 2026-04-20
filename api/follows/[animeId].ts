import { db, followsTable } from "../_db";
import { eq } from "drizzle-orm";

export default async function handler(req: any, res: any) {
  const animeId = Number(req.query.animeId);

  if (!animeId || isNaN(animeId)) {
    return res.status(400).json({ error: "Invalid anime ID" });
  }

  try {
    // PATCH /api/follows/:animeId — update watched episode count
    if (req.method === "PATCH") {
      const watchedEpisodes = Number(req.body?.watchedEpisodes);

      if (isNaN(watchedEpisodes) || watchedEpisodes < 0) {
        return res.status(400).json({ error: "Invalid watchedEpisodes value" });
      }

      const [updated] = await db
        .update(followsTable)
        .set({ watchedEpisodes })
        .where(eq(followsTable.animeId, animeId))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "Follow not found" });
      }

      return res.json(updated);
    }

    // DELETE /api/follows/:animeId — unfollow
    if (req.method === "DELETE") {
      await db.delete(followsTable).where(eq(followsTable.animeId, animeId));
      return res.status(204).send();
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[follows/:animeId]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
