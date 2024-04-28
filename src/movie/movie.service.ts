import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { MOVIES_PAGE_SIZE } from "src/constants";
import { $and, $criteria, $or } from "src/mongo";
import { Movie } from "src/movie/movie.schema";
import { MovieVote } from "./movie-vote.schema";
import { MovieFiltersDto, OrderBy } from "./movie.dto";

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
    const filterMinRuntime = $criteria(
      { runtime: { $gte: filters.minRuntime } },
      !!filters.minRuntime,
    );

    const filterMaxRuntime = $criteria(
      { runtime: { $lte: filters.maxRuntime } },
      !!filters.maxRuntime,
    );

    const filterGenres = $or(
      filters.genres?.map((genreId) => ({
        genres: { $elemMatch: { id: genreId } },
      })),
    );

    const filterRequiredGenres = $and(
      filters.requiredGenres?.map((genreId) => ({
        genres: { $elemMatch: { id: genreId } },
      })),
    );

    const minReleaseDate =
      filters.minReleaseDate && new Date(filters.minReleaseDate);
    const filterMinReleaseDate = $criteria(
      { release_date: { $gte: minReleaseDate } },
      !!filters.minReleaseDate,
    );

    const maxReleaseDate =
      filters.maxReleaseDate && new Date(filters.maxReleaseDate);
    const filterMaxReleaseDate = $criteria(
      { release_date: { $lte: maxReleaseDate } },
      !!filters.maxReleaseDate,
    );

    const skipPreviousResults = { _id: { $nin: filters.skip } };
    const sortCriteria = { sort: SORT_QUERY[filters.orderBy] };
    const filter = $and([
      filterMinRuntime,
      filterMaxRuntime,
      filterGenres,
      filterRequiredGenres,
      filterMinReleaseDate,
      filterMaxReleaseDate,
      skipPreviousResults,
    ]);

    const movies = await this.movieModel
      .find(filter, {}, sortCriteria)
      .limit(MOVIES_PAGE_SIZE)
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
