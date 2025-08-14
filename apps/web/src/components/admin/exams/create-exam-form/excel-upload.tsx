import { Upload, FileSpreadsheet, Loader2, AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";
import { useState, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { orpcClient as orpc } from "@/utils/orpc";
import type { ExamFormSchemaType, QuestionFormSchemaType } from "@/lib/schema/exam";

interface ExcelUploadProps {
	onSuccess?: (questionCount: number) => void;
	onError?: (error: string) => void;
}

interface ImportResult {
	success: boolean;
	message: string;
	data?: QuestionFormSchemaType[];
	validationErrors?: string[];
}

export const ExcelUpload = ({ onSuccess, onError }: ExcelUploadProps) => {
	const form = useFormContext<ExamFormSchemaType>();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadResult, setUploadResult] = useState<ImportResult | null>(null);
	const [uploadProgress, setUploadProgress] = useState(0);

	const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

			// Call the backend API
			const result = await orpc.exam.bulkUploadExcel.mutate({ file });
			
			clearInterval(progressInterval);
			setUploadProgress(100);

			if (result.success && result.data) {
				// Update form with imported questions
				form.setValue("questions", result.data);
				
				// Select first question by default
				form.setValue("formState.selectedQuestionIndex", 0);

				setUploadResult(result);
				onSuccess?.(result.data.length);
			} else {
				setUploadResult(result);
				onError?.(result.message);
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
			const errorResult: ImportResult = {
				success: false,
				message: errorMessage
			};
			setUploadResult(errorResult);
			onError?.(errorMessage);
		} finally {
			setIsUploading(false);
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
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
			fileInputRef.current.value = '';
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
								className="shadow-md transition-all hover:shadow-lg"
							>
								{isUploading ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<Upload className="mr-2 h-4 w-4" />
								)}
								Bulk Upload
								<HelpCircle className="ml-2 h-4 w-4 text-muted-foreground" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom" className="max-w-md">
							<div className="space-y-2">
								<p className="font-medium">Excel Format Requirements:</p>
								<div className="text-sm space-y-1">
									<p><strong>Headers:</strong> Question Text | Option A | Option B | Option C | Option D | Correct Answer | Marks</p>
									<p><strong>Example:</strong></p>
									<p>What is PM? | Plan projects | Manage people | Deliver value | Create docs | C | 2</p>
									<p><strong>Rules:</strong></p>
									<ul className="list-disc list-inside space-y-1">
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
					accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
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
						<span className="text-sm text-muted-foreground">
							Processing Excel file...
						</span>
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
											<ul className="list-disc list-inside space-y-1 text-sm">
												{uploadResult.validationErrors.map((error, index) => (
													<li key={index}>{error}</li>
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