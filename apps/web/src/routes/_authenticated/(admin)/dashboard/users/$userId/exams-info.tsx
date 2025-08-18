import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/_authenticated/(admin)/dashboard/users/$userId/exams-info",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>view exams</div>;
}
