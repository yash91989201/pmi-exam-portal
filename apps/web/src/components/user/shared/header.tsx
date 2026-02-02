import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function Header() {
	return (
		<header className="border-border border-b bg-background">
			<div className="container mx-auto flex h-24 items-center justify-between p-3 md:p-0">
				<Link to="/" className="flex items-center gap-6">
					<img src="/naukri-e-learning.webp" alt="Naukri E-Learning Logo" className="h-14 rounded-md" />
				</Link>
				<div className="flex items-center gap-4">
					<Button variant="ghost" asChild>
						<Link to="/exams">Support</Link>
					</Button>
					<Button variant="secondary" asChild>
						<Link to="/auth/admin/sign-in">Admin Sign In</Link>
					</Button>
				</div>
			</div>
		</header>
	);
}
