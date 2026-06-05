import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import { requireServerEnv } from "@/lib/env";
import * as schema from "./schema";

/**
 * Lazy-initialized Drizzle client for Neon Postgres.
 *
 * The module is importable without `DATABASE_URL` set — the client
 * is only constructed on first use. This lets the build pass in CI
 * environments where secrets aren't available.
 *
 * The Proxy pattern ensures `db.select()` etc. work transparently while
 * deferring the `requireServerEnv` call until the first query.
 */

let _db: NeonHttpDatabase<typeof schema> | null = null;

function initDb(): NeonHttpDatabase<typeof schema> {
  if (_db) return _db;
  const url = requireServerEnv("DATABASE_URL");
  const sql = neon(url);
  _db = drizzle(sql, { schema });
  return _db;
}

export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop) {
    const instance = initDb();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export type Database = NeonHttpDatabase<typeof schema>;
