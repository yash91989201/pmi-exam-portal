import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export const ImpersonateUserBtn = ({ userId }: { userId: string }) => {
	const navigate = useNavigate();

	const { mutateAsync: impersonateUser, isPending } = useMutation({
		mutationKey: ["impersonateUser"],
		mutationFn: async () => {
			const { data, error } = await authClient.admin.impersonateUser({
				userId,
			});

			if (data) {
				toast.success(`Started ${data.user.name}'s session.`);

				navigate({
					to: "/exams",
				});
			} else {
				toast.error(error.message);
			}
		},
	});

	return (
		<Button
			className="gap-1.5"
			disabled={isPending}
			onClick={() => impersonateUser()}
		>
			{isPending ? (
				<Loader2 className="size-4.5 animate-spin" />
			) : (
				<PlayCircle className="size-4.5" />
			)}
			<span>Start user's session</span>
		</Button>
	);
};
