import type { z } from "zod";
import type { PortalSettingsFormSchema } from "../schema/setting";

export type PortalSettingsFormSchemaType = z.infer<
	typeof PortalSettingsFormSchema
>;