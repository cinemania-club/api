import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { keyBy, pick } from "lodash";
import { Model } from "mongoose";
import { Anonymous } from "src/auth/auth.guard";
import { SEARCH_PAGE_SIZE } from "src/constants";
import { MovieVote } from "./movie-vote.schema";
import {
  MovieDetailsDto,
  MovieFiltersDto,
  SearchDto,
  VoteMovieDto,
} from "./movie.dto";
import { Movie } from "./movie.schema";
import { MovieService } from "./movie.service";

const ONBOARDING_VOTES = 10;

@Controller("/movies")
export class MovieController {
  constructor(
    private movieService: MovieService,
    @InjectModel(MovieVote.name) private movieVoteModel: Model<MovieVote>,
    @InjectModel(Movie.name) private moviesModel: Model<Movie>,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  @Anonymous()
  @Post()
  async getMovies(@Req() req: Request, @Body() filters: MovieFiltersDto) {
    const result = await this.movieService.getMovies(
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
      total: result.total,
      items: result.items.map((movie) =>
        pick(movie, [
          "_id",
          "title",
          "genres",
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
  @Get("/search")
  async search(@Body() dto: SearchDto) {
    const skipIds = dto.skip.map((e) => e.toString());
    const result = await this.elasticsearchService.search({
      _source: [],
      size: SEARCH_PAGE_SIZE,
      query: {
        bool: {
          must: { multi_match: { query: dto.query } },
          must_not: { ids: { values: skipIds } },
        },
      },
    });

    const ids = result.hits.hits.map((hit) => hit._id);
    const movies = await this.moviesModel.find({ _id: ids });
    const moviesById = keyBy(movies, "_id");
    const moviesByRelevance = ids.map((id) => moviesById[id]);

    return {
      movies: moviesByRelevance.map((movie) =>
        pick(movie, [
          "_id",
          "title",
          "genres",
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
  @Get("/:id")
  async getMovie(@Req() req: Request, @Param() movieDto: MovieDetailsDto) {
    const movie = await this.moviesModel.findById(movieDto.id).lean();
    if (!movie) return { movie: null };

    const vote = await this.movieVoteModel.findOne({
      userId: req.payload!.userId,
      movieId: movieDto.id,
    });
    const userVote = vote?.stars || null;

    return {
      movie: pick(
        {
          ...movie,
          id: movie._id,
          genres: movie.genres.map((genre) => genre.name),
          scaledVoteAverage: this.calculateScaledVote(movie.vote_average),
          userVote,
        },
        [
          "id",
          "title",
          "backdrop_path",
          "genres",
          "release_date",
          "runtime",
          "overview",
          "scaledVoteAverage",
          "userVote",
        ],
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

  private calculateScaledVote(vote: number) {
    return (4 * (vote - 1)) / 9 + 1;
  }
}
