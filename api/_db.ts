import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { followsTable, notificationPrefsTable, scheduleCacheTable } from "../lib/db/src/schema";

<<<<<<< HEAD
const { Pool } = pg;
=======
// ─────────────────────────────────────────────────────────────────────────────
// ← Paste your connection string here (Neon, Supabase, Railway, etc.)
// Format: postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
// ─────────────────────────────────────────────────────────────────────────────
const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://neondb_owner:npg_FB98PCejWnkM@ep-soft-cloud-ani2pbbk.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require";
>>>>>>> e59a94fdfec0b43c9afb397e949a3fb9d6ae7d60

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema: { followsTable, notificationPrefsTable, scheduleCacheTable } });
export { followsTable, notificationPrefsTable, scheduleCacheTable };
