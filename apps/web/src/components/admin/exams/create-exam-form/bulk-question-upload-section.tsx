import { FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import type { ExamFormSchemaType } from "@/lib/schema/exam";
import { cn } from "@/lib/utils";
import { orpcClient } from "@/utils/orpc";

export const BulkQuestionUploadSection = () => {
	const form = useFormContext<ExamFormSchemaType>();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isDragOver, setIsDragOver] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const handleFileSelect = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;
		setSelectedFile(file);
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

		setSelectedFile(file);
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

			const result = await orpcClient.admin.bulkUploadExcel({ file });

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

	const removeSelectedFile = () => {
		setSelectedFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div className="space-y-4">
			<div>
				<Label className="font-semibold text-base">Bulk Import Questions</Label>
				<p className="mt-1 text-muted-foreground text-sm">
					Upload an Excel file to import multiple questions at once
				</p>
			</div>

			<Card className="border-2 border-dashed transition-all duration-200 hover:border-primary/50">
				<CardContent className="p-6">
					{/* File Drop Zone */}
					{/** biome-ignore lint/a11y/useSemanticElements: <div is required here> */}
					<div
						className={cn(
							"relative cursor-pointer rounded-lg border-2 border-dashed transition-all duration-200",
							isDragOver
								? "border-primary bg-primary/5 shadow-md"
								: "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/20",
							isUploading && "pointer-events-none opacity-75",
						)}
						onDrop={handleDrop}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onClick={triggerFileSelect}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								triggerFileSelect();
							}
						}}
						role="button"
						tabIndex={0}
						aria-label="Click to upload Excel file or drag and drop"
					>
						<div className="p-6">
							<div className="flex flex-col items-center space-y-4 text-center">
								<div
									className={cn(
										"rounded-full p-3 transition-colors",
										isDragOver
											? "bg-primary/10 text-primary"
											: "bg-muted text-muted-foreground",
									)}
								>
									{isUploading ? (
										<Loader2 className="h-6 w-6 animate-spin" />
									) : (
										<FileSpreadsheet className="h-6 w-6" />
									)}
								</div>

								<div className="space-y-2">
									<p className="font-medium">
										{isUploading
											? "Processing your file..."
											: selectedFile
												? "File selected - click to change"
												: "Choose Excel File"}
									</p>
									<p className="text-muted-foreground text-sm">
										{isUploading
											? "Please wait while we process your Excel file"
											: "Drag and drop your Excel file here, or click to browse"}
									</p>
								</div>

								{!isUploading && !selectedFile && (
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="gap-2"
									>
										<Upload className="h-4 w-4" />
										Browse Files
									</Button>
								)}
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

					{/* Selected File Display */}
					{selectedFile && !isUploading && (
						<div className="mt-4 flex items-center justify-between rounded-lg border bg-muted/20 p-3">
							<div className="flex items-center gap-3">
								<FileSpreadsheet className="h-5 w-5 text-primary" />
								<div>
									<p className="font-medium text-sm">{selectedFile.name}</p>
									<p className="text-muted-foreground text-xs">
										{(selectedFile.size / 1024 / 1024).toFixed(2)} MB
									</p>
								</div>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={removeSelectedFile}
								className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					)}

					{/* Upload Progress */}
					{isUploading && (
						<div className="mt-4 space-y-2">
							<div className="flex items-center justify-between">
								<span className="font-medium text-sm">
									Processing Excel file...
								</span>
								<span className="text-muted-foreground text-sm">
									{uploadProgress}%
								</span>
							</div>
							<Progress value={uploadProgress} className="h-2" />
						</div>
					)}

					{/* File Format Info */}
					<div className="mt-4 rounded-lg bg-blue-50/50 p-4 dark:bg-blue-950/20">
						<div className="space-y-2 text-xs">
							<div className="font-medium text-blue-900 dark:text-blue-100">
								📋 Excel Format Requirements:
							</div>
							<div className="space-y-1 text-blue-800 dark:text-blue-200">
								<p>
									<strong>Required columns:</strong> Question Text, Option A,
									Option B, Option C, Option D, Correct Answer, Marks
								</p>
								<p>
									<strong>Supported formats:</strong> .xlsx, .xls, .ods
								</p>
								<p>
									<strong>Rules:</strong> At least 2 options required, Correct
									Answer must be A-F, Marks must be positive integers
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
