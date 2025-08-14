import * as XLSX from 'xlsx';
import { ExcelImportSchema, type ExcelImportType, type QuestionFormSchemaType } from '@/lib/schema/exam';

export interface ImportResult {
	success: boolean;
	data?: QuestionFormSchemaType[];
	error?: string;
	validationErrors?: string[];
}

export class ExcelImportError extends Error {
	constructor(message: string, public validationErrors?: string[]) {
		super(message);
		this.name = 'ExcelImportError';
	}
}

/**
 * Validates if the file is an Excel file
 */
export function validateExcelFile(file: File): boolean {
	const validTypes = [
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
		'application/vnd.ms-excel', // .xls
	];
	
	const validExtensions = ['.xlsx', '.xls'];
	const hasValidType = validTypes.includes(file.type);
	const hasValidExtension = validExtensions.some(ext => 
		file.name.toLowerCase().endsWith(ext)
	);
	
	return hasValidType || hasValidExtension;
}

/**
 * Parses Excel file and returns structured data
 */
export async function parseExcelFile(file: File): Promise<ExcelImportType> {
	if (!validateExcelFile(file)) {
		throw new ExcelImportError('Invalid file type. Please upload an Excel file (.xlsx or .xls)');
	}

	try {
		const buffer = await file.arrayBuffer();
		const workbook = XLSX.read(buffer, { type: 'array' });
		
		// Get the first worksheet
		const sheetName = workbook.SheetNames[0];
		if (!sheetName) {
			throw new ExcelImportError('Excel file is empty or contains no worksheets');
		}
		
		const worksheet = workbook.Sheets[sheetName];
		
		// Convert to JSON with header row
		const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
			header: 1,
			defval: ''
		}) as string[][];
		
		if (jsonData.length < 2) {
			throw new ExcelImportError('Excel file must contain at least a header row and one data row');
		}
		
		// Extract header and data rows
		const headers = jsonData[0];
		const dataRows = jsonData.slice(1);
		
		// Convert to object format
		const parsedData = dataRows
			.filter(row => row.some(cell => cell && cell.toString().trim())) // Filter out empty rows
			.map((row, index) => {
				const rowObject: Record<string, any> = {};
				headers.forEach((header, colIndex) => {
					const cellValue = row[colIndex];
					rowObject[header] = cellValue || '';
				});
				return rowObject;
			});

		if (parsedData.length === 0) {
			throw new ExcelImportError('No valid data rows found in Excel file');
		}

		// Validate the parsed data against schema
		const validationResult = ExcelImportSchema.safeParse(parsedData);
		
		if (!validationResult.success) {
			const errors = validationResult.error.errors.map(err => 
				`Row ${err.path[0] ? Number(err.path[0]) + 2 : '?'}: ${err.message}`
			);
			throw new ExcelImportError(
				'Excel data validation failed',
				errors
			);
		}
		
		return validationResult.data;
	} catch (error) {
		if (error instanceof ExcelImportError) {
			throw error;
		}
		throw new ExcelImportError(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

/**
 * Converts Excel data to question form schema format
 */
export function convertToQuestionSchema(excelData: ExcelImportType): QuestionFormSchemaType[] {
	return excelData.map((row, index) => {
		// Build options array from Excel columns
		const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
		const options = optionLabels
			.map((label, optionIndex) => {
				const optionKey = `Option ${label}` as keyof typeof row;
				const optionText = row[optionKey];
				
				if (optionText && optionText.trim()) {
					return {
						text: optionText.trim(),
						isCorrect: row["Correct Answer"] === label,
						order: optionIndex
					};
				}
				return null;
			})
			.filter((option): option is NonNullable<typeof option> => option !== null);

		return {
			text: row["Question Text"].trim(),
			mark: row["Marks"],
			order: index,
			options
		};
	});
}

/**
 * Main function to import Excel data and convert to form format
 */
export async function importExcelData(file: File): Promise<ImportResult> {
	try {
		const excelData = await parseExcelFile(file);
		const questions = convertToQuestionSchema(excelData);
		
		return {
			success: true,
			data: questions
		};
	} catch (error) {
		if (error instanceof ExcelImportError) {
			return {
				success: false,
				error: error.message,
				validationErrors: error.validationErrors
			};
		}
		
		return {
			success: false,
			error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}