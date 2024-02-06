import { Controller, Get } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Movie } from "src/movie/movie.schema";

@Controller("/movies")
export class MovieController {
  constructor(@InjectModel(Movie.name) private movieModel: Model<Movie>) {}

  @Get()
  async getMovies() {
    return this.movieModel.find();
  }
}
