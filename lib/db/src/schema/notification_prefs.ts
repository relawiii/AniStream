import { pgTable, serial, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const notificationPrefsTable = pgTable("notification_prefs", {
  id: serial("id").primaryKey(),
  notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
  defaultNotifyBeforeMinutes: integer("default_notify_before_minutes").notNull().default(10),
  notifyOnDelay: boolean("notify_on_delay").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertNotificationPrefsSchema = createInsertSchema(notificationPrefsTable).omit({ id: true, updatedAt: true });
export type InsertNotificationPrefs = z.infer<typeof insertNotificationPrefsSchema>;
export type NotificationPrefs = typeof notificationPrefsTable.$inferSelect;
