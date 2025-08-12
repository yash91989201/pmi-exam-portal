import { db } from "@/db";
import { auth } from "@/lib/auth";
import type { Context as HonoContext } from "hono";

export type CreateContextOptions = {
	context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
	const session = await auth.api.getSession({
		headers: context.req.raw.headers,
	});

	return {
		session,
		db,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
