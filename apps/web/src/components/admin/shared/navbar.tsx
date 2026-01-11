import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const links = [
	{ href: "/dashboard", label: "Dashboard" },
	{ href: "/dashboard/exams", label: "Exams" },
	{ href: "/dashboard/users", label: "Users" },
	{ href: "/dashboard/orders", label: "Orders" },
];

export const AdminNavbar = () => {
	const router = useRouter();

	const { mutateAsync: signOut, isPending } = useMutation({
		mutationKey: ["signOut"],
		mutationFn: async () => {
			const res = await authClient.signOut();
			if (res.data?.success) {
				router.navigate({ to: "/auth/admin/sign-in" });
				return;
			}
			toast.error("Unable to logout try again");
		},
	});
	return (
		<nav className="border-border border-b bg-background py-3">
			<div className="container mx-auto flex items-center justify-between gap-6">
				<img src="/pmi_logo.webp" alt="PMI Logo" className="h-14" />
				<div className="flex flex-1 items-center gap-5">
					{links.map(({ href, label }) => (
						<Link
							key={href}
							to={href}
							className={buttonVariants({
								variant: "link",
								className: "px-3 py-1 font-normal",
							})}
						>
							{label}
						</Link>
					))}
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
