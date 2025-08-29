import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/_authenticated/(admin)/dashboard/users/$userId/",
)({
	component: RouteComponent,
});

function RouteComponent() {
	// const userId = Route.useParams().userId;
	return <p>user exam info and stats</p>;
}
