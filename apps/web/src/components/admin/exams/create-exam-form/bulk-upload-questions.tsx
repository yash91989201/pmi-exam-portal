import { FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import type { ExamFormSchemaType } from "@/lib/schema/exam";
import { cn } from "@/lib/utils";
import { orpcClient } from "@/utils/orpc";

export const BulkUploadQuestions = () => {
	const form = useFormContext<ExamFormSchemaType>();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isDragOver, setIsDragOver] = useState(false);

	// Bulk upload functionality
	const handleFileSelect = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;
		await processFile(file);
	};

	const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsDragOver(false);

		const file = event.dataTransfer.files?.[0];
		if (!file) return;

		// Check if it's an Excel file
		const allowedTypes = [
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			"application/vnd.ms-excel",
			"application/vnd.oasis.opendocument.spreadsheet",
		];

		if (
			!allowedTypes.includes(file.type) &&
			!file.name.match(/\.(xlsx|xls|ods)$/i)
		) {
			toast.error("Please upload a valid Excel file (.xlsx, .xls, or .ods)");
			return;
		}

		await processFile(file);
	};

	const processFile = async (file: File) => {
		setIsUploading(true);
		setUploadProgress(0);

		try {
			// Simulate progress updates for better UX
			const progressInterval = setInterval(() => {
				setUploadProgress((prev) => Math.min(prev + 10, 90));
			}, 200);

			const result = await orpcClient.exam.bulkUploadExcel({ file });

			clearInterval(progressInterval);
			setUploadProgress(100);

			if (result.success && result.data) {
				form.setValue("questions", result.data);
				form.setValue("formState.selectedQuestionIndex", 0);
				toast.success(`Successfully imported ${result.data.length} questions!`);
			} else {
				toast.error(result.message || "Failed to import questions");
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "An unexpected error occurred";
			toast.error(errorMessage);
		} finally {
			setIsUploading(false);
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsDragOver(true);
	};

	const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsDragOver(false);
	};

	const triggerFileSelect = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className="space-y-4">
			<div>
				<Label className="font-semibold text-base">Bulk Import Questions</Label>
				<p className="mt-1 text-muted-foreground text-sm">
					Upload an Excel file to import multiple questions at once
				</p>
			</div>

			{/** biome-ignore lint/a11y/noStaticElementInteractions: <div is required here> */}
			<div
				className={cn(
					"relative rounded-lg border-2 border-dashed transition-all duration-200",
					isDragOver
						? "border-primary bg-primary/5 shadow-md"
						: "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/20",
					isUploading && "pointer-events-none opacity-75",
				)}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
			>
				<div className="p-8">
					<div className="flex flex-col items-center space-y-4 text-center">
						<div className="rounded-full bg-muted p-4">
							{isUploading ? (
								<Loader2 className="h-8 w-8 animate-spin text-primary" />
							) : (
								<FileSpreadsheet className="h-8 w-8 text-primary" />
							)}
						</div>

						<div className="space-y-2">
							<p className="font-medium text-lg">
								{isUploading
									? "Processing your file..."
									: "Import questions from Excel"}
							</p>
							<p className="max-w-md text-muted-foreground text-sm">
								{isUploading
									? "Please wait while we process your Excel file"
									: "Drag and drop your Excel file here, or click to browse"}
							</p>
						</div>

						{!isUploading && (
							<Button
								type="button"
								variant="outline"
								onClick={triggerFileSelect}
								className="gap-3"
								size="lg"
							>
								<Upload className="h-4 w-4" />
								Choose Excel File
							</Button>
						)}

						<div className="space-y-1 text-muted-foreground text-xs">
							<p>
								<strong>Supported formats:</strong> .xlsx, .xls, .ods
							</p>
							<p>
								<strong>Required columns:</strong> Question Text, Option A,
								Option B, Option C, Option D, Correct Answer, Marks
							</p>
						</div>
					</div>
				</div>

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
						<span className="font-medium text-sm">
							Processing Excel file...
						</span>
					</div>
					<Progress value={uploadProgress} className="h-2" />
				</div>
			)}
		</div>
	);
};
