import { db, notificationPrefsTable } from "./_db";
import { eq } from "drizzle-orm";

async function ensurePrefs() {
  const existing = await db
    .select()
    .from(notificationPrefsTable)
    .limit(1);

  if (existing.length > 0) return existing[0];

  const [prefs] = await db
    .insert(notificationPrefsTable)
    .values({
      notificationsEnabled: true,
      defaultNotifyBeforeMinutes: 10,
      notifyOnDelay: true,
    })
    .returning();

  return prefs;
}

export default async function handler(req: any, res: any) {
  try {
    // GET /api/notification-prefs
    if (req.method === "GET") {
      const prefs = await ensurePrefs();
      return res.json(prefs);
    }

    // PUT /api/notification-prefs
    if (req.method === "PUT") {
      const { notificationsEnabled, defaultNotifyBeforeMinutes, notifyOnDelay } =
        req.body ?? {};

      const current = await ensurePrefs();

      const [updated] = await db
        .update(notificationPrefsTable)
        .set({
          notificationsEnabled: Boolean(notificationsEnabled ?? current.notificationsEnabled),
          defaultNotifyBeforeMinutes: Number(defaultNotifyBeforeMinutes ?? current.defaultNotifyBeforeMinutes),
          notifyOnDelay: Boolean(notifyOnDelay ?? current.notifyOnDelay),
          updatedAt: new Date(),
        })
        .where(eq(notificationPrefsTable.id, current.id))
        .returning();

      return res.json(updated);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[notification-prefs]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
