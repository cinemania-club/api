import { Body, Controller, Get } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Movie } from "src/movie/movie.schema";
import { MovieFilterDto } from "./dto/movieFilter.dto";

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

    return this.movieModel.find({
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
    });
  }
}
