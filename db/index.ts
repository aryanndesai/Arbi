import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type DbInstance = ReturnType<typeof drizzle<typeof schema>>;

// Lazy singleton — postgres() is NOT called until the first query.
// This prevents build-time crashes when DATABASE_URL is a placeholder.
let _db: DbInstance | undefined;

export function getDb(): DbInstance {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set in environment");
    const client = postgres(url, {
      prepare: false, // required for Supabase pgBouncer (transaction mode)
      max: 1,         // serverless: one connection per worker
    });
    _db = drizzle(client, { schema });
  }
  return _db;
}
