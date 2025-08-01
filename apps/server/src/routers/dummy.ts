import { z } from "zod";
import { publicProcedure } from "@/lib/orpc";

// Movie schema for output validation
const MovieSchema = z.object({
	name: z.string(),
	length: z.number(),
	description: z.string(),
	rating: z.number(),
});

const MoviesListSchema = z.array(MovieSchema);

// Dummy movie data
const dummyMovies = [
	{
		name: "The Shawshank Redemption",
		length: 142,
		description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
		rating: 9.3,
	},
	{
		name: "The Godfather",
		length: 175,
		description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
		rating: 9.2,
	},
	{
		name: "The Dark Knight",
		length: 152,
		description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
		rating: 9.0,
	},
	{
		name: "Pulp Fiction",
		length: 154,
		description: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
		rating: 8.9,
	},
	{
		name: "Forrest Gump",
		length: 142,
		description: "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man.",
		rating: 8.8,
	},
];

export const dummy = {
	getMovies: publicProcedure
		.output(MoviesListSchema)
		.handler(async () => {
			return dummyMovies;
		}),
};