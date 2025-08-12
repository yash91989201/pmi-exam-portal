import { createContext, useContext } from 'react'
import type { ReactFormApi } from '@tanstack/react-form'

interface ExamFormData {
	certification: string;
	questions: Array<{
		text: string;
		mark: number;
		imageDriveId: string;
		options: Array<{
			text: string;
			isCorrect: boolean;
		}>;
	}>;
}

// Create the form context
const FormContext = createContext<any>(null)

export const FormProvider = FormContext.Provider

// Custom hook to use the form context
export function useFormContext() {
	const context = useContext(FormContext)
	if (!context) {
		throw new Error('useFormContext must be used within a FormProvider')
	}
	return context
}