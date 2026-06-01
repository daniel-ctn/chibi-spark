import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import { requireServerEnv } from "@/lib/env";
import * as schema from "./schema";

const sql = neon(requireServerEnv("DATABASE_URL"));

export const db = drizzle(sql, { schema });

export type Database = typeof db;
