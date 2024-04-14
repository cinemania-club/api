import { Body, Controller, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { Anonymous } from "src/auth/auth.guard";
import { MovieFiltersDto } from "./dto/movie-filters.dto";
import { MovieService } from "./movie.service";

@Controller("/movies")
export class MovieController {
  constructor(private movieService: MovieService) {}

  @Anonymous()
  @Post()
  async getMovies(@Body() filters: MovieFiltersDto, @Req() request: Request) {
    console.log(request.payload?.userId);
    return this.movieService.getMovies(filters);
  }
}
