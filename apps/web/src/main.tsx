import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import Loader from "@/components/loader";
import { createRouter } from "@/router";
import { queryClient } from "@/utils/orpc";

const router = createRouter();

// Configure router with additional options for client-side
router.update({
	defaultPendingComponent: () => <Loader />,
	Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
	},
});

const rootElement = document.getElementById("app");

if (!rootElement) {
	throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(<RouterProvider router={router} />);
}
