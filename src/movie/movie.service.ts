import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Movie } from "src/movie/movie.schema";
import { MovieFiltersDto, OrderBy } from "./dto/movie-filters.dto";
import { MovieVote } from "./movie-vote.schema";

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

    const movies = await this.movieModel.find(
      {
        $and: [
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
    );

    const movieIds = movies.map((movie) => movie._id);

    const userVotes = await this.movieVoteModel.find({
      userId: userId,
      movieId: { $in: movieIds },
    });

    console.log(userVotes);
    return movies;
  }
}
