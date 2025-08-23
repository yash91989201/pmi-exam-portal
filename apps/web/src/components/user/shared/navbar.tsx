import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { Loader2, LogOut } from "lucide-react";
import { Suspense } from "react";
import { toast } from "sonner";
import {
	StopImpersonationBtn,
	StopImpersonationBtnSkeleton,
} from "@/components/admin/user/stop-impersonation-btn";
import { Button, buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const links = [
	{ href: "/exams", label: "Exams" },
	{ href: "/orders", label: "Orders" },
	{ href: "/certificates", label: "Certificates" },
];

export const UserNavbar = () => {
	const router = useRouter();

	const { mutateAsync: signOut, isPending } = useMutation({
		mutationKey: ["signOut"],
		mutationFn: async () => {
			const res = await authClient.signOut();
			if (res.data?.success) {
				router.navigate({ to: "/" });
				return;
			}
			toast.error("Unable to logout try again");
		},
	});

	return (
		<nav className="border-border border-b bg-background py-6">
			<div className="container mx-auto flex items-center justify-between gap-6">
				<img src="/pmi_logo.webp" alt="PMI Logo" className="h-12 w-auto" />
				<div className="flex flex-1 items-center gap-5">
					{links.map(({ href, label }) => (
						<Link
							key={href}
							to={href}
							activeOptions={{ exact: true }}
							activeProps={{
								className: "underline",
							}}
							className={buttonVariants({
								variant: "link",
								className: "px-3 py-1 font-normal text-sm",
							})}
						>
							{label}
						</Link>
					))}
				</div>
				<div className="flex items-center gap-3">
					<Suspense fallback={<StopImpersonationBtnSkeleton />}>
						<StopImpersonationBtn />
					</Suspense>
				</div>
				<div className="flex items-center gap-4">
					<Button onClick={() => signOut()}>
						{isPending ? (
							<Loader2 className="size-4.5 animate-spin" />
						) : (
							<LogOut className="size-4.5" />
						)}
						<span>Logout</span>
					</Button>
				</div>
			</div>
		</nav>
	);
};
