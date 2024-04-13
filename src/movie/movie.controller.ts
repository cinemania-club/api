import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { Model } from "mongoose";
import { AuthGuard } from "src/auth/auth.guard";
import { Movie } from "src/movie/movie.schema";
import { MovieFilterDto, OrderBy } from "./dto/movieFilter.dto";

const SORT_QUERY = {
  [OrderBy.CREATED_AT_ASC]: { createdAt: 1 },
  [OrderBy.CREATED_AT_DESC]: { createdAt: -1 },
  [OrderBy.RELEASE_DATE_ASC]: { release_date: 1 },
  [OrderBy.RELEASE_DATE_DESC]: { release_date: -1 },
};

@UseGuards(AuthGuard)
@Controller("/movies")
export class MovieController {
  constructor(@InjectModel(Movie.name) private movieModel: Model<Movie>) {}

  @Post()
  async getMovies(
    @Body() movieFilter: MovieFilterDto,
    @Req() request: Request,
  ) {
    console.log(request.payload?.userId);

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
