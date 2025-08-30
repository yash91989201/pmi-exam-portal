import { Link } from "@tanstack/react-router";
import type { FC } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

type PaginationWindowProps = {
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage?: boolean;
	hasPreviousPage?: boolean;
	basePath: string; // e.g. '/dashboard/exams'
	maxItems?: number; // default 5
};

/**
 * Reusable pagination window component that shows up to `maxItems` page buttons,
 * centering the current page when possible. Uses the project's Pagination UI.
 */
export const PaginationWindow: FC<PaginationWindowProps> = ({
	page,
	limit,
	totalPages,
	basePath,
	maxItems = 5,
	// keeping next/prev flags to allow callers to control button disabled state
	hasNextPage = true,
	hasPreviousPage = true,
}) => {
	const pages: number[] = [];

	if (totalPages <= maxItems) {
		for (let p = 1; p <= totalPages; p++) pages.push(p);
	} else {
		const half = Math.floor(maxItems / 2);
		let start = Math.max(1, page - half);
		let end = start + maxItems - 1;

		if (end > totalPages) {
			end = totalPages;
			start = totalPages - maxItems + 1;
		}

		for (let p = start; p <= end; p++) pages.push(p);
	}

	const showLeftEllipsis = pages.length && pages[0] > 1;
	const showRightEllipsis =
		pages.length && pages[pages.length - 1] < totalPages;

	return (
		<Pagination className="mx-0 w-fit justify-end">
			<PaginationContent>
				<PaginationItem>
					<Link
						to={basePath}
						search={{ page: Math.max(1, page - 1), limit }}
						className={cn(
							buttonVariants({ variant: "outline", size: "icon" }),
							!hasPreviousPage && "pointer-events-none opacity-50",
						)}
						aria-disabled={!hasPreviousPage}
						tabIndex={!hasPreviousPage ? -1 : 0}
					>
						‹
					</Link>
				</PaginationItem>

				{showLeftEllipsis && (
					<>
						<PaginationItem key="first">
							<Link
								to={basePath}
								search={{ page: 1, limit }}
								className={cn(
									buttonVariants({ variant: "outline", size: "icon" }),
								)}
							>
								1
							</Link>
						</PaginationItem>
						<PaginationEllipsis />
					</>
				)}

				{pages.map((pageNum) => (
					<PaginationItem key={pageNum}>
						<Link
							to={basePath}
							search={{ page: pageNum, limit }}
							className={cn(
								buttonVariants({ variant: "outline", size: "icon" }),
								page === pageNum &&
									"bg-accent font-bold text-accent-foreground hover:bg-accent hover:text-accent-foreground",
							)}
							aria-current={page === pageNum ? "page" : undefined}
						>
							{pageNum}
						</Link>
					</PaginationItem>
				))}

				{showRightEllipsis && (
					<>
						<PaginationEllipsis />
						<PaginationItem key="last">
							<Link
								to={basePath}
								search={{ page: totalPages, limit }}
								className={cn(
									buttonVariants({ variant: "outline", size: "icon" }),
								)}
							>
								{totalPages}
							</Link>
						</PaginationItem>
					</>
				)}

				<PaginationItem>
					<Link
						to={basePath}
						search={{ page: Math.min(totalPages, page + 1), limit }}
						className={cn(
							buttonVariants({ variant: "outline", size: "icon" }),
							!hasNextPage && "pointer-events-none opacity-50",
						)}
						aria-disabled={!hasNextPage}
						tabIndex={!hasNextPage ? -1 : 0}
					>
						›
					</Link>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
};
