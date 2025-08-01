import { QueryClientProvider } from "@tanstack/react-query";
import { hydrateRoot, createRoot } from 'react-dom/client';
import { RouterClient } from '@tanstack/react-router/ssr/client';
import { createRouter } from '@/router';
import { queryClient } from "@/utils/orpc";

const router = createRouter();

// Configure router with Wrap for client hydration
router.update({
	Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
	},
});

const rootElement = document.getElementById('app');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Check if we need to hydrate or render fresh
if (rootElement.innerHTML && rootElement.innerHTML.trim() !== '') {
  // Server-rendered content exists, hydrate it
  hydrateRoot(rootElement, <RouterClient router={router} />);
} else {
  // No server-rendered content, render fresh (fallback for development)
  const root = createRoot(rootElement);
  root.render(<RouterClient router={router} />);
}