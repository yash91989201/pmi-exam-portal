import { Link } from "@tanstack/react-router";
import { Suspense } from "react";
import {
	StopImpersonationBtn,
	StopImpersonationBtnSkeleton,
} from "@/components/admin/user/stop-impersonation-btn";
import { buttonVariants } from "@/components/ui/button";

export const UserNavbar = () => {
	const links = [
		{ href: "/exams", label: "Exams" },
		{ href: "/orders", label: "Orders" },
		{ href: "/certificates", label: "Certificates" },
	];

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
			</div>
		</nav>
	);
};
