import { ORPCError, os } from "@orpc/server";
import { createAdminSettingsManager } from "@/utils/admin-settings-manager";
import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
	if (!context.session || !context.session.user) {
		throw new ORPCError("UNAUTHORIZED");
	}

	return next({
		context: {
			session: context.session,
		},
	});
});

const requireAdmin = o.middleware(async ({ context, next }) => {
	if (!context.session || !context.session.user) {
		throw new ORPCError("UNAUTHORIZED");
	}

	if (context.session.user.role !== "admin") {
		throw new ORPCError("FORBIDDEN");
	}
	const adminSettingsManager = createAdminSettingsManager(context.db);

	return next({
		context: {
			session: context.session,
			adminSettingsManager,
		},
	});
});

export const protectedProcedure = publicProcedure.use(requireAuth);

export const adminProcedure = publicProcedure.use(requireAdmin);
