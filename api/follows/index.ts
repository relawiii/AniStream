import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, followsTable } from "../_db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const FollowAnimeBody = z.object({
  animeId: z.number().int(),
  animeTitle: z.string(),
  animeCoverImage: z.string().nullable().optional(),
  notifyBeforeMinutes: z.number().int().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    if (req.method === "GET") {
      const follows = await db.select().from(followsTable).orderBy(followsTable.createdAt);
      return res.json(follows);
    }

    if (req.method === "POST") {
      const parsed = FollowAnimeBody.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid request body" });

      const existing = await db.select().from(followsTable).where(eq(followsTable.animeId, parsed.data.animeId));
      if (existing.length > 0) return res.status(201).json(existing[0]);

      const [follow] = await db.insert(followsTable).values({
        animeId: parsed.data.animeId,
        animeTitle: parsed.data.animeTitle,
        animeCoverImage: parsed.data.animeCoverImage ?? null,
        notifyBeforeMinutes: parsed.data.notifyBeforeMinutes ?? 10,
      }).returning();

      return res.status(201).json(follow);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
