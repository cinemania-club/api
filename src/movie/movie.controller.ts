import { Body, Controller, Get } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { InjectModel } from "@nestjs/mongoose";
import { keyBy, pick } from "lodash";
import { Model } from "mongoose";
import { Anonymous } from "src/auth/auth.guard";
import { SEARCH_PAGE_SIZE } from "src/constants";
import { SearchDto } from "./movie.dto";
import { Movie } from "./movie.schema";

@Controller("/movies")
export class MovieController {
  constructor(
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
}
