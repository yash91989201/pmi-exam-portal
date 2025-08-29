import { useRouter, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function useManageExamsAssignmentFilter({ userId }: { userId: string }) {
	const router = useRouter();
	const { exam, status, cursor } = useSearch({
		from: "/_authenticated/(admin)/dashboard/users/$userId/manage-exams-assignment",
	});

	const [internalSearch, setInternalSearch] = useState(exam ?? "");
	const [cursorHistory, setCursorHistory] = useState<string[]>([]);

	useEffect(() => {
		setInternalSearch(exam ?? "");
	}, [exam]);

	useEffect(() => {
		const handler = setTimeout(() => {
			router.navigate({
				to: "/dashboard/users/$userId/manage-exams-assignment",
				params: { userId },
				search: (prev) => ({ ...prev, exam: internalSearch || undefined, cursor: undefined }),
				replace: true,
			});
		}, 500);

		return () => {
			clearTimeout(handler);
		};
	}, [internalSearch, router, userId]);

	const onStatusChange = (newStatus: "all" | "assigned" | "unassigned") => {
		router.navigate({
			to: "/dashboard/users/$userId/manage-exams-assignment",
			params: { userId },
			search: (prev) => ({ ...prev, status: newStatus, cursor: undefined }),
			replace: true,
		});
	};

	const onClearFilters = () => {
		router.navigate({
			to: "/dashboard/users/$userId/manage-exams-assignment",
			params: { userId },
			search: { limit: 10 },
			replace: true,
		});
	};

	const goToNextPage = (nextCursor: string) => {
		setCursorHistory((prev) => [...prev, cursor ?? ""]);
		router.navigate({
			to: "/dashboard/users/$userId/manage-exams-assignment",
			params: { userId },
			search: (prev) => ({ ...prev, cursor: nextCursor }),
			replace: true,
		});
	};

	const goToPreviousPage = () => {
		const prevCursor = cursorHistory[cursorHistory.length - 1];
		setCursorHistory((prev) => prev.slice(0, -1));
		router.navigate({
			to: "/dashboard/users/$userId/manage-exams-assignment",
			params: { userId },
			search: (prev) => ({ ...prev, cursor: prevCursor || undefined }),
			replace: true,
		});
	};

	return {
		searchQuery: exam,
		internalSearch,
		setInternalSearch,
		status,
		onStatusChange,
		onClearFilters,
		goToNextPage,
		goToPreviousPage,
		canGoPrevious: cursorHistory.length > 0,
	};
}
