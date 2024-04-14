import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Movie } from "src/movie/movie.schema";
import { MovieFiltersDto, OrderBy } from "./dto/movie-filters.dto";

const SORT_QUERY = {
  [OrderBy.CREATED_AT_ASC]: { createdAt: 1 },
  [OrderBy.CREATED_AT_DESC]: { createdAt: -1 },
  [OrderBy.RELEASE_DATE_ASC]: { release_date: 1 },
  [OrderBy.RELEASE_DATE_DESC]: { release_date: -1 },
};

@Injectable()
export class MovieService {
  constructor(@InjectModel(Movie.name) private movieModel: Model<Movie>) {}

  async getMovies(filters: MovieFiltersDto) {
    const minReleaseDate = new Date(filters.minReleaseDate);
    const maxReleaseDate = new Date(filters.maxReleaseDate);

    const genres = filters.genres.map((e) => ({
      genres: { $elemMatch: { id: e } },
    }));

    const requiredGenres = filters.requiredGenres.map((e) => ({
      genres: { $elemMatch: { id: e } },
    }));

    return this.movieModel.find(
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
  }
}
