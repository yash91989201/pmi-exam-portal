import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { StandardRPCJsonSerializer } from "@orpc/client/standard";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { appRouter } from "../../../server/src/routers/index";

const serializer = new StandardRPCJsonSerializer();

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 60 * 1000, // > 0 to prevent immediate refetching on mount
		},
		dehydrate: {
			serializeData(data) {
				const [json, meta] = serializer.serialize(data);
				return { json, meta };
			},
		},
		hydrate: {
			deserializeData(data) {
				return serializer.deserialize(data.json, data.meta);
			},
		},
	},
	queryCache: new QueryCache({
		onError: (error) => {
			toast.error(`Error: ${error.message}`, {
				action: {
					label: "retry",
					onClick: () => {
						queryClient.invalidateQueries();
					},
				},
			});
		},
	}),
});

export const link = new RPCLink({
	url: `${import.meta.env.VITE_SERVER_URL}/rpc`,
	fetch(url, options) {
		return fetch(url, {
			...options,
			credentials: "include",
		});
	},
});

export const orpcClient: RouterClient<typeof appRouter> =
	createORPCClient(link);

export const queryUtils = createTanstackQueryUtils(orpcClient);
