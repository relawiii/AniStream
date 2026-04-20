import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, notificationPrefsTable } from "../_db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const UpdateNotificationPrefsBody = z.object({
  notificationsEnabled: z.boolean(),
  defaultNotifyBeforeMinutes: z.number().int(),
  notifyOnDelay: z.boolean(),
});

async function ensurePrefs() {
  const existing = await db.select().from(notificationPrefsTable).limit(1);
  if (existing.length === 0) {
    const [prefs] = await db.insert(notificationPrefsTable).values({
      notificationsEnabled: true,
      defaultNotifyBeforeMinutes: 10,
      notifyOnDelay: true,
    }).returning();
    return prefs;
  }
  return existing[0];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    if (req.method === "GET") {
      const prefs = await ensurePrefs();
      return res.json(prefs);
    }

    if (req.method === "PUT") {
      const parsed = UpdateNotificationPrefsBody.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid request body" });

      const current = await ensurePrefs();
      const [updated] = await db
        .update(notificationPrefsTable)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(notificationPrefsTable.id, current.id))
        .returning();

      return res.json(updated);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
