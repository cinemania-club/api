import { Body, Controller, Get, Param, Req } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { keyBy, pick } from "lodash";
import { Model } from "mongoose";
import { Anonymous } from "src/auth/auth.guard";
import { SEARCH_PAGE_SIZE } from "src/constants";
import { MovieVote } from "./movie-vote.schema";
import { MovieDetailsDto, SearchDto } from "./movie.dto";
import { Movie } from "./movie.schema";

@Controller("/movies")
export class MovieController {
  constructor(
    @InjectModel(MovieVote.name) private movieVoteModel: Model<MovieVote>,
    @InjectModel(Movie.name) private moviesModel: Model<Movie>,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

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
          genres: movie.genres.map((genre) => genre.name),
          scaledVoteAverage: this.calculateScaledVote(movie.vote_average),
          userVote,
        },
        [
          "_id",
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

  private calculateScaledVote(vote: number) {
    return (4 * (vote - 1)) / 9 + 1;
  }
}
