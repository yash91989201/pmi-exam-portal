import { eq } from "drizzle-orm";
import { userExam } from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";
import { ListUserExamsOutput } from "@/lib/schema";

export const userRouter = {
	listExams: protectedProcedure
		.output(ListUserExamsOutput)
		.handler(async ({ context }) => {
			const userExams = await context.db.query.userExam.findMany({
				where: eq(userExam.userId, context.session.user.id),
				with: {
					exam: true,
				},
			});

			return { userExams };
		}),
};

export type UserRouterType = typeof userRouter;
