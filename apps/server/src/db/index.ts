import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";
import * as authSchema from "@/db/schema/auth";
import { env } from "@/env";

// node-postgres driver: works on Node and Bun (bun-sql needs the Bun runtime).
export const db = drizzle(new Pool({ connectionString: env.DATABASE_URL }), {
	schema: { ...schema, ...authSchema },
});

export type DBType = typeof db;
