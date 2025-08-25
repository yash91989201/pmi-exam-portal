import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Loader2, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { queryClient, queryUtils } from "@/utils/orpc";

export const StopImpersonationBtn = () => {
	const router = useRouter();

	const { data: sessionData } = useSuspenseQuery({
		queryKey: ["session-data"],
		queryFn: async () => {
			const { data, error } = await authClient.getSession();
			if (error) {
				throw new Error(error.message);
			}

			return data;
		},
	});

	const { mutateAsync: stopImpersonating, isPending } = useMutation({
		mutationKey: ["stop-impsersonating", sessionData?.user.id],
		mutationFn: async () => {
			const { data, error } = await authClient.admin.stopImpersonating();

			if (data) {
				if (sessionData) {
					toast.success(`Stopped ${sessionData.user.name}'s session.`);

					queryClient.invalidateQueries({
						queryKey: queryUtils.key(),
					});

					router.navigate({
						to: "/dashboard/users/$userId/manage-user",
						params: {
							userId: sessionData.user.id,
						},
						replace: true,
					});
				}
			} else {
				toast.error(error.message);
			}
		},
	});

	if (!sessionData?.session.impersonatedBy) {
		return null;
	}

	return (
		<Button
			className="gap-1.5"
			disabled={isPending}
			onClick={() => stopImpersonating()}
		>
			{isPending ? (
				<Loader2 className="size-4.5 animate-spin" />
			) : (
				<Square className="size-4.5" />
			)}
			<span>Stop {sessionData.user.name}'s session</span>
		</Button>
	);
};

export const StopImpersonationBtnSkeleton = () => {
	return <Skeleton className="h-9 w-48" />;
};
