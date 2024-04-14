import { Body, Controller, Post, Req } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { Model } from "mongoose";
import { Anonymous } from "src/auth/auth.guard";
import { Movie } from "src/movie/movie.schema";
import { MovieFiltersDto, OrderBy } from "./dto/movie-filters.dto";

const SORT_QUERY = {
  [OrderBy.CREATED_AT_ASC]: { createdAt: 1 },
  [OrderBy.CREATED_AT_DESC]: { createdAt: -1 },
  [OrderBy.RELEASE_DATE_ASC]: { release_date: 1 },
  [OrderBy.RELEASE_DATE_DESC]: { release_date: -1 },
};

@Controller("/movies")
export class MovieController {
  constructor(@InjectModel(Movie.name) private movieModel: Model<Movie>) {}

  @Anonymous()
  @Post()
  async getMovies(@Body() filters: MovieFiltersDto, @Req() request: Request) {
    console.log(request.payload?.userId);

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
