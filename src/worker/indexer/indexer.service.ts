import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { InjectModel } from "@nestjs/mongoose";
import { addMinutes, sub } from "date-fns";
import { pick } from "lodash";
import { Model } from "mongoose";
import { Movie } from "src/movie/movie.schema";
import {
  MOVIES_BATCH_SIZE,
  MOVIES_FRESHNESS_DURATION,
} from "./indexer.constants";

@Injectable()
export class IndexerService {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<Movie>,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async indexMovies() {
    console.info(`Starting to index movies`);

    const freshnessDate = sub(new Date(), MOVIES_FRESHNESS_DURATION);
    const movies = await this.movieModel.find(
      {
        $or: [
          { $expr: { $lt: ["$indexedAt", "$updatedAt"] } },
          { indexedAt: { $lte: freshnessDate } },
        ],
      },
      { original_title: 1, title: 1, tagline: 1, overview: 1 },
      { limit: MOVIES_BATCH_SIZE },
    );

    if (!movies.length) {
      console.info(`No movies to index`);
      return;
    }

    const moviesIds = movies.map((movie) => movie._id);
    console.info(`Indexing movies: ${moviesIds}`);

    const operations = movies
      .map((movie) => [
        { index: { _id: movie._id.toString() } },
        pick(movie, ["original_title", "title", "tagline", "overview"]),
      ])
      .flat();

    const result = await this.elasticsearchService.bulk({
      refresh: true,
      index: "movies",
      operations,
    });

    if (result.errors) {
      console.info(`Failed to index movies: ${moviesIds}`);
      return;
    }

    console.info(`Movies indexed: ${moviesIds}`);

    // Adding 1 minute for safety reasons
    const indexedAt = addMinutes(new Date(), 1);
    await this.movieModel.updateMany(
      { _id: { $in: moviesIds } },
      { indexedAt },
    );

    console.info(`Updated indexedAt fot movies: ${moviesIds}`);
  }
}
