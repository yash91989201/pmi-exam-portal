import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ExamForm } from "@/components/admin/exam-form";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute(
	"/_authenticated/admin/dashboard/exams/new-exam",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="container mx-auto space-y-6 p-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link to="/admin/dashboard/exams">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Exams
					</Link>
				</Button>
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Create New Exam</h1>
					<p className="text-muted-foreground">
						Set up a new PMI certification exam
					</p>
				</div>
			</div>

			<div className="mx-auto max-w-md">
				<Card>
					<CardHeader>
						<CardTitle>Exam Details</CardTitle>
						<CardDescription>
							Enter the basic information for your new exam
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ExamForm />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
