import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { AttemptExamForm } from "@/components/user/attempt-exam-form";
import { authClient } from "@/lib/auth-client";

const RouteSearchSchema = z.object({
	examId: z.string(),
});

export const Route = createFileRoute(
	"/_authenticated/(user-exam)/attempt-exam",
)({
	component: RouteComponent,
	validateSearch: RouteSearchSchema,
});

function RouteComponent() {
	const { examId } = Route.useSearch();

	const { data: sessionData } = useSuspenseQuery({
		queryKey: ["sessionData"],
		queryFn: async () => {
			const { data, error } = await authClient.getSession();
			if (error) {
				throw new Error(error.message);
			}

			return data;
		},
	});

	const isImpersonating =
		typeof sessionData?.session?.impersonatedBy === "string";

	if (!examId) {
		throw notFound();
	}

	return <AttemptExamForm examId={examId} isImpersonating={isImpersonating} />;
}
