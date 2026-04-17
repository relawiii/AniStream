import { pgTable, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scheduleCacheTable = pgTable("schedule_cache", {
  id: serial("id").primaryKey(),
  animeId: integer("anime_id").notNull().unique(),
  episodeNumber: integer("episode_number").notNull(),
  airingAt: integer("airing_at").notNull(),
  detectedAt: timestamp("detected_at").notNull().defaultNow(),
  wasDelayed: boolean("was_delayed").notNull().default(false),
});

export const insertScheduleCacheSchema = createInsertSchema(scheduleCacheTable).omit({ id: true, detectedAt: true, wasDelayed: true });
export type InsertScheduleCache = z.infer<typeof insertScheduleCacheSchema>;
export type ScheduleCache = typeof scheduleCacheTable.$inferSelect;
