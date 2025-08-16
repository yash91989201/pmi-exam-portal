import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/_authenticated/(admin)/dashboard/users/",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>users</div>;
}
