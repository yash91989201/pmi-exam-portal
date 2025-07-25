import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import { env } from "@/env";

export const db = drizzle(env.DATABASE_URL, { schema });
