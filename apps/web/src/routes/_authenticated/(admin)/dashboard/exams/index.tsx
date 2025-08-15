import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { queryUtils } from "@/utils/orpc";

export const Route = createFileRoute(
	"/_authenticated/(admin)/dashboard/exams/",
)({
	validateSearch: z.object({ page: z.number().default(1) }),
	beforeLoad: async ({ context, search }) => {
		context.queryClient.ensureQueryData(
			context.queryUtils.exam.listExams.queryOptions({
				input: { page: search.page, pageSize: 1 },
			}),
		);
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { page } = Route.useSearch();
	const pageSize = 10;
	const { data, isLoading, error } = useQuery(
		queryUtils.exam.listExams.queryOptions({ input: { page, pageSize } }),
	);

	const total = data?.total || 0;
	const lastPage = Math.ceil(total / pageSize) || 1;

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
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Description</TableHead>
								<TableHead>Created</TableHead>
								<TableHead>Updated</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading && (
								<TableRow>
									<TableCell colSpan={5} className="py-8 text-center">
										Loading exams...
									</TableCell>
								</TableRow>
							)}
							{error && (
								<TableRow>
									<TableCell
										colSpan={5}
										className="py-8 text-center text-destructive"
									>
										Error loading exams: {error.message}
									</TableCell>
								</TableRow>
							)}
							{data && data.exams.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={5}
										className="py-8 text-center text-muted-foreground"
									>
										No exams created yet. Create your first exam to get started.
									</TableCell>
								</TableRow>
							)}
							{data?.exams?.map((exam) => (
								<TableRow key={exam.id}>
									<TableCell>{exam.certification}</TableCell>
									<TableCell>{exam.mark}</TableCell>
									<TableCell>
										{/* TODO: Actions - Edit/View/Delete */}
										<Button variant="outline" size="sm">
											View
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					<div className="flex items-center justify-between pt-4">
						<Button variant="outline" size="sm" disabled={page <= 1} asChild>
							<Link to="/dashboard/exams" search={{ page: page - 1 }}>
								Previous
							</Link>
						</Button>
						<span>
							Page {page} of {lastPage}
						</span>
						<Button
							variant="outline"
							size="sm"
							disabled={page >= lastPage}
							asChild
						>
							<Link to="/dashboard/exams" search={{ page: page - 1 }}>
								Next
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
