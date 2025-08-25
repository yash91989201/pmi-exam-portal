import type { z } from "zod";
import type {
	PortalSettingsSchema,
	GetPortalSettingsOutput,
	UpdatePortalSettingsInput,
	UpdatePortalSettingsOutput,
} from "../schema/setting";

export type PortalSettingsSchemaType = z.infer<typeof PortalSettingsSchema>;
export type GetPortalSettingsOutputType = z.infer<
	typeof GetPortalSettingsOutput
>;
export type UpdatePortalSettingsInputType = z.infer<
	typeof UpdatePortalSettingsInput
>;
export type UpdatePortalSettingsOutputType = z.infer<
	typeof UpdatePortalSettingsOutput
>;