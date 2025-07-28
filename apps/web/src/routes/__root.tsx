import "@/index.css";

import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	redirect,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { authClient } from "@/lib/auth-client";
import type { orpcClient, queryUtils } from "@/utils/orpc";

export interface RouterAppContext {
	orpcClient: typeof orpcClient;
	queryUtils: typeof queryUtils;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	head: () => ({
		meta: [
			{
				title: "PMI Exam Portal",
			},
			{
				name: "description",
				content: "PMI Exam Portal",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
	beforeLoad: async ({ location }) => {
		if (location.pathname === "/login") {
			return;
		}

		const session = await authClient.getSession();

		if (!session.data) {
			throw redirect({
				to: location.pathname === "/admin" ? "/auth/admin/login" : "/",
				search: {
					redirect: location.href,
				},
			});
		}
		throw redirect({
			to: session.data.user.role === "admin" ? "/admin" : "/user",
			search: {
				redirect: location.href,
			},
		});
	},
	component: RootComponent,
});

function RootComponent() {
	return (
		<>
			<HeadContent />
			<ThemeProvider
				attribute="class"
				storageKey="theme"
				defaultTheme="dark"
				disableTransitionOnChange
			>
				<div className="grid h-svh grid-rows-[auto_1fr]">
					<Header />
					<Outlet />
				</div>
				<Toaster richColors />
			</ThemeProvider>
			<TanStackRouterDevtools position="bottom-left" />
			<ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
		</>
	);
}
