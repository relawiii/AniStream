import { Router } from "express";
import { db, notificationPrefsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateNotificationPrefsBody } from "@workspace/api-zod";

const router = Router();

const ensurePrefs = async () => {
  const existing = await db.select().from(notificationPrefsTable).limit(1);
  if (existing.length === 0) {
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
  return existing[0];
};

router.get("/", async (req, res) => {
  const prefs = await ensurePrefs();
  res.json(prefs);
});

router.put("/", async (req, res) => {
  const parsed = UpdateNotificationPrefsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const current = await ensurePrefs();

  const [updated] = await db
    .update(notificationPrefsTable)
    .set({
      notificationsEnabled: parsed.data.notificationsEnabled,
      defaultNotifyBeforeMinutes: parsed.data.defaultNotifyBeforeMinutes,
      notifyOnDelay: parsed.data.notifyOnDelay,
      updatedAt: new Date(),
    })
    .where(eq(notificationPrefsTable.id, current.id))
    .returning();

  res.json(updated);
});

export default router;
