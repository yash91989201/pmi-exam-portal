import { createContext, useContext } from 'react'

// Create the form context with proper typing
// Using any for the form instance due to complex TanStack Form generics
const FormContext = createContext<any>(null)

export const FormProvider = FormContext.Provider

/**
 * Custom hook to access the exam form context
 * @throws {Error} When used outside of FormProvider
 * @returns The exam form API instance
 */
export function useFormContext() {
	const context = useContext(FormContext)
	if (!context) {
		throw new Error('useFormContext must be used within a FormProvider')
	}
	return context
}