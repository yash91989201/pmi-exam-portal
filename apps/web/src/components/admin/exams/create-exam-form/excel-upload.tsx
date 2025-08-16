import {
	AlertCircle,
	CheckCircle2,
	FileSpreadsheet,
	HelpCircle,
	Loader2,
	Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
	ExamFormSchemaType,
	QuestionFormSchemaType,
} from "@/lib/schema/exam";
import { orpcClient as orpc } from "@/utils/orpc";

interface ImportResult {
	success: boolean;
	message: string;
	data?: QuestionFormSchemaType[];
	validationErrors?: string[];
}

export const ExcelUpload = () => {
	const form = useFormContext<ExamFormSchemaType>();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadResult, setUploadResult] = useState<ImportResult | null>(null);
	const [uploadProgress, setUploadProgress] = useState(0);

	const handleFileSelect = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setIsUploading(true);
		setUploadResult(null);
		setUploadProgress(0);

		try {
			// Simulate progress updates for better UX
			const progressInterval = setInterval(() => {
				setUploadProgress((prev) => Math.min(prev + 10, 90));
			}, 200);

			const result = await orpc.exam.bulkUploadExcel({ file });

			clearInterval(progressInterval);
			setUploadProgress(100);

			if (result.success && result.data) {
				form.setValue("questions", result.data);

				form.setValue("formState.selectedQuestionIndex", 0);
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "An unexpected error occurred";
			const errorResult: ImportResult = {
				success: false,
				message: errorMessage,
			};
			setUploadResult(errorResult);
		} finally {
			setIsUploading(false);
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const triggerFileSelect = () => {
		fileInputRef.current?.click();
	};

	const resetUpload = () => {
		setUploadResult(null);
		setUploadProgress(0);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-4">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								type="button"
								size="lg"
								variant="outline"
								onClick={triggerFileSelect}
								disabled={isUploading}
								className="gap-3 shadow-md transition-all hover:shadow-lg"
							>
								{isUploading ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<Upload className="size-4" />
								)}
								<span>Bulk Upload</span>
								<HelpCircle className="text-muted-foreground" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom" className="max-w-md">
							<div className="space-y-2">
								<p className="font-medium">Excel Format Requirements:</p>
								<div className="space-y-1 text-sm">
									<p>
										<strong>Headers:</strong> Question Text | Option A | Option
										B | Option C | Option D | Correct Answer | Marks
									</p>
									<p>
										<strong>Example:</strong>
									</p>
									<p>
										What is PM? | Plan projects | Manage people | Deliver value
										| Create docs | C | 2
									</p>
									<p>
										<strong>Rules:</strong>
									</p>
									<ul className="list-inside space-y-1">
										<li>At least 2 options (A, B) required per question</li>
										<li>Correct Answer must be A, B, C, D, E, or F</li>
										<li>Marks must be positive integers</li>
										<li>Supports .xlsx and .xls files</li>
									</ul>
								</div>
							</div>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<input
					ref={fileInputRef}
					type="file"
					accept=".ods,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
					onChange={handleFileSelect}
					className="hidden"
					aria-label="Upload Excel file"
				/>
			</div>

			{/* Upload Progress */}
			{isUploading && (
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<FileSpreadsheet className="h-4 w-4" />
						<span className="text-foreground">Processing Excel file...</span>
					</div>
					<Progress value={uploadProgress} className="h-2" />
				</div>
			)}

			{/* Upload Results */}
			{uploadResult && !isUploading && (
				<div className="space-y-3">
					{uploadResult.success ? (
						<Alert className="border-green-200 bg-green-50">
							<CheckCircle2 className="h-4 w-4 text-green-600" />
							<AlertDescription className="text-green-800">
								{uploadResult.message}
							</AlertDescription>
						</Alert>
					) : (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								<div className="space-y-2">
									<p>{uploadResult.message}</p>
									{uploadResult.validationErrors && (
										<div className="space-y-1">
											<p className="font-medium">Validation errors:</p>
											<ul className="list-inside list-disc space-y-1 text-sm">
												{uploadResult.validationErrors.map((error) => (
													<li key={error}>{error}</li>
												))}
											</ul>
										</div>
									)}
								</div>
							</AlertDescription>
						</Alert>
					)}

					<Button
						type="button"
						size="sm"
						variant="ghost"
						onClick={resetUpload}
						className="text-muted-foreground hover:text-foreground"
					>
						Clear Status
					</Button>
				</div>
			)}
		</div>
	);
};
