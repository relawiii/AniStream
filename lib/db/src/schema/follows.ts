import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const followsTable = pgTable("follows", {
  id: serial("id").primaryKey(),
  animeId: integer("anime_id").notNull().unique(),
  animeTitle: text("anime_title").notNull(),
  animeCoverImage: text("anime_cover_image"),
  notifyBeforeMinutes: integer("notify_before_minutes").notNull().default(10),
  watchedEpisodes: integer("watched_episodes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFollowSchema = createInsertSchema(followsTable).omit({ id: true, createdAt: true });
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type Follow = typeof followsTable.$inferSelect;
