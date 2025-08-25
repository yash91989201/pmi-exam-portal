import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen } from "lucide-react";
import { CreateExamForm } from "@/components/admin/exams/create-exam-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute(
	"/_authenticated/(admin)/dashboard/exams/create-exam",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="container mx-auto space-y-6">
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="sm" asChild>
						<Link to="/dashboard/exams">
							<ArrowLeft className="size-4.5" />
							Back to Exams
						</Link>
					</Button>
				</div>

				<div className="space-y-4 text-center">
					<div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
						<BookOpen className="h-8 w-8 text-primary" />
					</div>
					<div className="space-y-2">
						<h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text font-bold text-4xl text-transparent tracking-tight">
							Create New Exam
						</h1>
						<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
							Design comprehensive PMI certification exams with multiple-choice
							questions, custom scoring, and detailed answer options.
						</p>
					</div>
				</div>

				<Separator className="my-8" />
			</div>

			<CreateExamForm />
		</div>
	);
}
