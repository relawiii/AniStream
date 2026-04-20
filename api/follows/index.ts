import { db, followsTable } from "./_db";
import { eq } from "drizzle-orm";

export default async function handler(req: any, res: any) {
  try {
    // GET /api/follows — list all follows
    if (req.method === "GET") {
      const follows = await db
        .select()
        .from(followsTable)
        .orderBy(followsTable.createdAt);
      return res.json(follows);
    }

    // POST /api/follows — create a follow
    if (req.method === "POST") {
      const { animeId, animeTitle, animeCoverImage, notifyBeforeMinutes } =
        req.body ?? {};

      if (!animeId || !animeTitle) {
        return res.status(400).json({ error: "Invalid request body" });
      }

      const existing = await db
        .select()
        .from(followsTable)
        .where(eq(followsTable.animeId, Number(animeId)));

      if (existing.length > 0) {
        return res.status(201).json(existing[0]);
      }

      const [follow] = await db
        .insert(followsTable)
        .values({
          animeId: Number(animeId),
          animeTitle: String(animeTitle),
          animeCoverImage: animeCoverImage ?? null,
          notifyBeforeMinutes: Number(notifyBeforeMinutes ?? 10),
        })
        .returning();

      return res.status(201).json(follow);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[follows]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
