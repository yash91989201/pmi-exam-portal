import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function Header() {
	return (
		<header className="border-border border-b bg-background">
			<div className="container mx-auto flex h-18 items-center justify-between p-3 md:p-0">
				<Link to="/" className="flex items-center gap-6">
					<img src="/pmi_logo.webp" alt="PMI Logo" className="h-12" />
					<h2 className="font-bold text-2xl text-foreground">Exam Portal</h2>
				</Link>
				<div className="flex items-center gap-4">
					<Button variant="ghost" asChild>
						<Link to="/exams">Support</Link>
					</Button>
					<Button variant="secondary" asChild>
						<Link to="/auth/admin/login">Admin Login</Link>
					</Button>
				</div>
			</div>
		</header>
	);
}
