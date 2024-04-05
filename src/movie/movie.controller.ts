import { Body, Controller, Get } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Movie } from "src/movie/movie.schema";
import { MovieFilterDto, OrderBy } from "./dto/movieFilter.dto";

const SORT_QUERY = {
  [OrderBy.CREATED_AT_ASC]: { createdAt: 1 },
  [OrderBy.CREATED_AT_DESC]: { createdAt: -1 },
  [OrderBy.RELEASE_DATE_ASC]: { release_date: 1 },
  [OrderBy.RELEASE_DATE_DESC]: { release_date: 1 },
};

@Controller("/movies")
export class MovieController {
  constructor(@InjectModel(Movie.name) private movieModel: Model<Movie>) {}

  @Get()
  async getMovies(@Body() movieFilter: MovieFilterDto) {
    const minReleaseDate = new Date(movieFilter.minReleaseDate);
    const maxReleaseDate = new Date(movieFilter.maxReleaseDate);

    const genres = movieFilter.genres.map((e) => ({
      genres: { $elemMatch: { id: e } },
    }));

    const requiredGenres = movieFilter.requiredGenres.map((e) => ({
      genres: { $elemMatch: { id: e } },
    }));

    return this.movieModel.find(
      {
        $and: [
          {
            runtime: {
              $gte: movieFilter.minRuntime,
              $lte: movieFilter.maxRuntime,
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
      { sort: SORT_QUERY[movieFilter.orderBy] },
    );
  }
}
