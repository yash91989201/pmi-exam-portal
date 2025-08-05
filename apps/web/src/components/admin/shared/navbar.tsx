import { Link } from "@tanstack/react-router";
import { Button, buttonVariants } from "@/components/ui/button";

export const AdminNavbar = () => {
	const links = [
		{ href: "/dashboard", label: "Dashboard" },
		{ href: "/dashboard/exams", label: "Exams" },
		{ href: "/dashboard/users", label: "Users" },
	];

	return (
		<nav className="border-border border-b bg-background py-4">
			<div className="container mx-auto flex items-center justify-between">
				<div className="flex items-center gap-8">
					<img src="/pmi_logo.webp" alt="PMI Logo" className="h-12 w-auto" />
					{links.map(({ href, label }) => (
						<Link
							key={href}
							to={href}
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
};
