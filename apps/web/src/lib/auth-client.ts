import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: "https://api.exam.dev.pmiindia.org",
	plugins: [adminClient()],
});

export const { admin } = authClient;
