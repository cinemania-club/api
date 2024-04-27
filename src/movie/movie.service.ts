import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Movie } from "src/movie/movie.schema";
import { MovieVote } from "./movie-vote.schema";
import { MovieFiltersDto, OrderBy } from "./movie.dto";

const PAGE_SIZE = 100;
const SORT_QUERY = {
  [OrderBy.CREATED_AT_ASC]: { createdAt: 1 },
  [OrderBy.CREATED_AT_DESC]: { createdAt: -1 },
  [OrderBy.RELEASE_DATE_ASC]: { release_date: 1 },
  [OrderBy.RELEASE_DATE_DESC]: { release_date: -1 },
};

@Injectable()
export class MovieService {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<Movie>,
    @InjectModel(MovieVote.name) private movieVoteModel: Model<MovieVote>,
  ) {}

  async getMovies(filters: MovieFiltersDto, userId: Types.ObjectId) {
    const minReleaseDate = new Date(filters.minReleaseDate);
    const maxReleaseDate = new Date(filters.maxReleaseDate);

    const genres = filters.genres.map((genreId) => ({
      genres: { $elemMatch: { id: genreId } },
    }));

    const requiredGenres = filters.requiredGenres.map((genreId) => ({
      genres: { $elemMatch: { id: genreId } },
    }));

    const movies = await this.movieModel
      .find(
        {
          $and: [
            { _id: { $nin: filters.skip } },
            { overview: new RegExp(filters.search, "gi") },
            {
              runtime: {
                $gte: filters.minRuntime,
                $lte: filters.maxRuntime,
              },
            },
            {
              release_date: {
                $gte: minReleaseDate,
                $lte: maxReleaseDate,
              },
            },
            ...requiredGenres,
            { $or: genres.length ? genres : [{}] },
          ],
        },
        {},
        { sort: SORT_QUERY[filters.orderBy] },
      )
      .limit(PAGE_SIZE)
      .lean();

    const movieIds = movies.map((movie) => movie._id);

    const userVotes = await this.movieVoteModel.find({
      userId: userId,
      movieId: { $in: movieIds },
    });

    const fullMovie = movies.map((movie) => ({
      ...movie,
      userVote: userVotes.find((vote) => vote.movieId === movie._id)?.stars,
    }));

    return fullMovie;
  }
}
