import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute(
	"/_authenticated/(admin)/dashboard/exams/",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">
						Exams Management
					</h1>
					<p className="text-muted-foreground">
						Create and manage PMI certification exams
					</p>
				</div>
				<Button asChild>
					<Link to="/dashboard/exams/create-exam">
						<Plus className="mr-2 h-4 w-4" />
						Create New Exam
					</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Existing Exams</CardTitle>
					<CardDescription>
						Manage your certification exams and their questions
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="py-8 text-center text-muted-foreground">
						No exams created yet. Create your first exam to get started.
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
