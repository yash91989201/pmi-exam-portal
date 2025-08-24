import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [tailwindcss(), tanstackRouter({}), react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@server-schemas": path.resolve(__dirname, "../server/src/lib/schema"),
			"@server-types": path.resolve(__dirname, "../server/src/lib/types"),
		},
	},
	// preview: {
	// 	allowedHosts: import.meta.env.VITE_ALLOWED_HOSTS
	// 		? import.meta.env.VITE_ALLOWED_HOSTS.split(",")
	// 		: [],
	// },
});
