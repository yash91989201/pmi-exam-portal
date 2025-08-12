/**
 * Represents an answer option for a question
 */
export interface Option {
	text: string;
	isCorrect: boolean;
}

/**
 * Represents a question in the exam
 */
export interface Question {
	text: string;
	mark: number;
	imageDriveId: string;
	options: Option[];
}

/**
 * Represents the complete exam form data
 */
export interface ExamFormData {
	certification: string;
	questions: Question[];
}

/**
 * Form subscription state type
 */
export interface FormSubscriptionState {
	isSubmitting: boolean;
	canSubmit: boolean;
	errors: string[];
}