import { forwardRef } from "react";
import { Link } from "@tanstack/react-router";
import { Button, buttonVariants } from "@/components/ui/button";

export const AdminNavbar = forwardRef<HTMLElement>((_, ref) => {
	const links = [
		{ href: "/dashboard", label: "Dashboard" },
		{ href: "/dashboard/exams", label: "Exams" },
		{ href: "/dashboard/users", label: "Users" },
	];

	return (
		<nav ref={ref} className="border-border border-b bg-background py-6">
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
				<div className="flex items-center gap-4">
					<Button variant="secondary" size="sm">
						Logout
					</Button>
				</div>
			</div>
		</nav>
	);
});
