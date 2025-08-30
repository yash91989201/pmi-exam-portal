import { useRouter, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function useExamsTableFilter() {
	const router = useRouter();
	const { page, limit, certification } = useSearch({
		from: "/_authenticated/(admin)/dashboard/exams/",
	});

	const [internalSearch, setInternalSearch] = useState(certification ?? "");

	useEffect(() => {
		setInternalSearch(certification ?? "");
	}, [certification]);

	useEffect(() => {
		const handler = setTimeout(() => {
			router.navigate({
				to: "/dashboard/exams",
				search: (prev) => ({ ...prev, certification: internalSearch.trim() === '' ? undefined : internalSearch, page: 1 }),
				replace: true,
			});
		}, 500);

		return () => {
			clearTimeout(handler);
		};
	}, [internalSearch, router]);

	const onLimitChange = (newLimit: number) => {
		router.navigate({
			to: "/dashboard/exams",
			search: (prev) => ({ ...prev, limit: newLimit, page: 1 }),
			replace: true,
		});
	};

	return {
		page,
		limit,
		certification,
		internalSearch,
		setInternalSearch,
		onLimitChange,
	};
}
