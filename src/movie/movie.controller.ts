import { Body, Controller, Post, Req } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { pick } from "lodash";
import { Model } from "mongoose";
import { Anonymous } from "src/auth/auth.guard";
import { MovieFiltersDto } from "./dto/movie-filters.dto";
import { VoteMovieDto } from "./dto/vote-movie.dto";
import { MovieVote } from "./movie-vote.schema";
import { MovieService } from "./movie.service";

const ONBOARDING_VOTES = 10;

@Controller("/movies")
export class MovieController {
  constructor(
    private movieService: MovieService,
    @InjectModel(MovieVote.name) private movieVoteModel: Model<MovieVote>,
  ) {}

  @Anonymous()
  @Post()
  async getMovies(@Req() req: Request, @Body() filters: MovieFiltersDto) {
    const movies = await this.movieService.getMovies(
      filters,
      req.payload!.userId,
    );

    const votes = await this.movieVoteModel.countDocuments({
      userId: req.payload!.userId,
      stars: { $ne: null },
    });

    let onboarding = null;
    if (votes < ONBOARDING_VOTES) {
      onboarding = { votes, target: ONBOARDING_VOTES };
    }

    return {
      onboarding,
      movies: movies.map((movie) =>
        pick(movie, [
          "_id",
          "title",
          "runtime",
          "release_date",
          "vote_average",
          "poster_path",
          "overview",
          "userVote",
        ]),
      ),
    };
  }

  @Anonymous()
  @Post("/vote")
  async vote(@Req() req: Request, @Body() vote: VoteMovieDto) {
    await this.movieVoteModel.updateOne(
      {
        movieId: vote.movieId,
        userId: req.payload!.userId,
      },
      { stars: vote.stars || null },
      { upsert: true },
    );
  }
}
