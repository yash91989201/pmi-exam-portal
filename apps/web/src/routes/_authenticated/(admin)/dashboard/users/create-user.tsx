import { CreateUserForm } from "@/components/admin/user/create-user-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/_authenticated/(admin)/dashboard/users/create-user",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<CreateUserForm />
		</div>
	);
}
