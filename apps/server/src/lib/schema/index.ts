import z from "zod"

export * from "./auth"

export const ToggleRegistrationInput = z.object({
  enabled: z.boolean(),
})

export const ToggleRegistrationOutput = z.object({
  success: z.boolean(),
  message: z.string().optional(),
})
