import * as XLSX from "xlsx";
import { ZodError } from "zod";
import { ExcelImportSchema } from "@/lib/schema/exam";
import type { ExcelImportType, QuestionFormData } from "@/lib/types/exam";

export interface ImportResult {
	success: boolean;
	data?: QuestionFormData[];
	error?: string;
	validationErrors?: string[];
}

export class ExcelImportError extends Error {
	constructor(
		message: string,
		public validationErrors?: string[],
	) {
		super(message);
		this.name = "ExcelImportError";
	}
}

/**
 * Validates if the file is an Excel file by checking MIME type and file extension
 */
export function validateExcelFile(file: File): boolean {
	const validTypes = [
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
		"application/vnd.ms-excel", // .xls
	];

	const validExtensions = [".xlsx", ".xls", ".ods"];
	const hasValidType = validTypes.includes(file.type);
	const hasValidExtension = validExtensions.some((ext) =>
		file.name.toLowerCase().endsWith(ext),
	);

	return hasValidType || hasValidExtension;
}

/**
 * Parses Excel file buffer and returns structured data
 */
export async function parseExcelBuffer(
	buffer: ArrayBuffer,
	filename: string,
): Promise<ExcelImportType> {
	// Validate file extension
	const validExtensions = [".xlsx", ".xls", ".ods"];
	const hasValidExtension = validExtensions.some((ext) =>
		filename.toLowerCase().endsWith(ext),
	);

	if (!hasValidExtension) {
		throw new ExcelImportError(
			"Invalid file type. Please upload an Excel file (.xlsx or .xls)",
		);
	}

	try {
		const workbook = XLSX.read(buffer, { type: "array" });

		// Get the first worksheet
		const sheetName = workbook.SheetNames[0];
		if (!sheetName) {
			throw new ExcelImportError(
				"Excel file is empty or contains no worksheets",
			);
		}

		const worksheet = workbook.Sheets[sheetName];
		const jsonData = XLSX.utils.sheet_to_json(worksheet);
		const validationResult = ExcelImportSchema.parse(jsonData);

		return validationResult;
	} catch (error) {
		if (error instanceof ExcelImportError) {
			throw error;
		}

		if (error instanceof ZodError) {
			const validationErrors = error.issues.map((err) => {
				const path = err.path.length > 0 ? `[${err.path.join(".")}]` : "";
				return `${path} ${err.message}`;
			});

			throw new ExcelImportError(
				"Excel file format is invalid. Please check the required columns and data format.",
				validationErrors,
			);
		}

		throw new ExcelImportError(
			`Failed to parse Excel file: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

/**
 * Converts Excel data to question form schema format
 */
export function convertToQuestionSchema(
	excelData: ExcelImportType,
): QuestionFormData[] {
	return excelData.map((row, index) => {
		// Build options array from Excel columns
		const optionLabels = ["A", "B", "C", "D", "E", "F"];
		const options = optionLabels
			.map((label, optionIndex) => {
				const optionKey = `Option ${label}` as keyof typeof row;
				const optionText = row[optionKey];

				if (!optionText) return null;

				return {
					text: optionText.toString().trim(),
					isCorrect: row["Correct Option"] === label,
					order: optionIndex,
				};
			})
			.filter(
				(option): option is NonNullable<typeof option> => option !== null,
			);

		return {
			id: "",
			imageId: "",
			examId: "",
			text: row["Question Text"].trim(),
			mark: row.Marks,
			order: index,
			options,
		};
	});
}

/**
 * Main function to import Excel buffer and convert to form format
 */
export async function importExcelData(
	buffer: ArrayBuffer,
	filename: string,
): Promise<ImportResult> {
	try {
		const excelData = await parseExcelBuffer(buffer, filename);
		const questions = convertToQuestionSchema(excelData);

		return {
			success: true,
			data: questions,
		};
	} catch (error) {
		if (error instanceof ExcelImportError) {
			return {
				success: false,
				error: error.message,
				validationErrors: error.validationErrors,
			};
		}

		return {
			success: false,
			error: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}
