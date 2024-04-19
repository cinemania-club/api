import { Body, Controller, Post, Req } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { Model } from "mongoose";
import { Anonymous } from "src/auth/auth.guard";
import { MovieFiltersDto } from "./dto/movie-filters.dto";
import { VoteMovieDto } from "./dto/vote-movie.dto";
import { MovieVote } from "./movie-vote.schema";
import { MovieService } from "./movie.service";

@Controller("/movies")
export class MovieController {
  constructor(
    private movieService: MovieService,
    @InjectModel(MovieVote.name) private movieVoteModel: Model<MovieVote>,
  ) {}

  @Anonymous()
  @Post()
  async getMovies(@Body() filters: MovieFiltersDto, @Req() request: Request) {
    return await this.movieService.getMovies(filters, request.payload!.userId);
  }

  @Anonymous()
  @Post("/vote")
  async vote(@Req() req: Request, @Body() vote: VoteMovieDto) {
    await this.movieVoteModel.updateOne(
      {
        movieId: vote.movieId,
        userId: req.payload!.userId,
      },
      { stars: vote.stars },
      { upsert: true },
    );
  }
}
