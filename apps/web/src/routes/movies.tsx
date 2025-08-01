import { createFileRoute } from "@tanstack/react-router";
import { orpcClient } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/movies")({
	component: MoviesComponent,
});

interface Movie {
	name: string;
	length: number;
	description: string;
	rating: number;
}

function MoviesComponent() {
	const moviesQuery = useQuery({
		queryKey: ["movies"],
		queryFn: () => orpcClient.dummy.getMovies(),
	});

	if (moviesQuery.isLoading) {
		return (
			<div className="container mx-auto max-w-4xl px-4 py-8">
				<div className="text-center">Loading movies...</div>
			</div>
		);
	}

	if (moviesQuery.isError) {
		return (
			<div className="container mx-auto max-w-4xl px-4 py-8">
				<div className="text-center text-red-500">
					Error loading movies: {moviesQuery.error?.message}
				</div>
			</div>
		);
	}

	const movies: Movie[] = moviesQuery.data || [];

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			<h1 className="text-3xl font-bold mb-8 text-center">Movie Collection</h1>
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{movies.map((movie: Movie, index: number) => (
					<div
						key={index}
						className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
					>
						<h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
							{movie.name}
						</h3>
						<div className="mb-3 space-y-2">
							<div className="flex justify-between items-center">
								<span className="text-sm text-gray-600 dark:text-gray-400">
									Duration:
								</span>
								<span className="text-sm font-medium">
									{movie.length} min
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm text-gray-600 dark:text-gray-400">
									Rating:
								</span>
								<span className="text-sm font-medium text-yellow-600">
									⭐ {movie.rating}/10
								</span>
							</div>
						</div>
						<p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
							{movie.description}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}