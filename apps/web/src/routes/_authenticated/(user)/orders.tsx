import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/(user)/orders")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_authenticated/(user)/orders"!</div>;
}
