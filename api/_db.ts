import { drizzle } from "drizzle-orm/node-postgres";
import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import pg from "pg";

// ─────────────────────────────────────────────────────────────────────────────
// ← Paste your connection string here (Neon, Supabase, Railway, etc.)
// Format: postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
// ─────────────────────────────────────────────────────────────────────────────
const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://neondb_owner:npg_FB98PCejWnkM@ep-soft-cloud-ani2pbbk.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require";

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  max: 5, // keep connection pool small for serverless
});

// ── Table schemas (mirrored from lib/db — no workspace import needed) ─────────

export const followsTable = pgTable("follows", {
  id: serial("id").primaryKey(),
  animeId: integer("anime_id").notNull().unique(),
  animeTitle: text("anime_title").notNull(),
  animeCoverImage: text("anime_cover_image"),
  notifyBeforeMinutes: integer("notify_before_minutes").notNull().default(10),
  watchedEpisodes: integer("watched_episodes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notificationPrefsTable = pgTable("notification_prefs", {
  id: serial("id").primaryKey(),
  notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
  defaultNotifyBeforeMinutes: integer("default_notify_before_minutes").notNull().default(10),
  notifyOnDelay: boolean("notify_on_delay").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const scheduleCacheTable = pgTable("schedule_cache", {
  id: serial("id").primaryKey(),
  animeId: integer("anime_id").notNull().unique(),
  episodeNumber: integer("episode_number").notNull(),
  airingAt: integer("airing_at").notNull(),
  detectedAt: timestamp("detected_at").notNull().defaultNow(),
  wasDelayed: boolean("was_delayed").notNull().default(false),
});

export const db = drizzle(pool, {
  schema: { followsTable, notificationPrefsTable, scheduleCacheTable },
});
