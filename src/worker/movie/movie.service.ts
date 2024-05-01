import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { InjectModel } from "@nestjs/mongoose";
import { addMinutes, subDays } from "date-fns";
import { pick } from "lodash";
import { Model } from "mongoose";
import { Movie } from "src/movie/movie.schema";

@Injectable()
export class MovieService {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<Movie>,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async indexMovies() {
    const lastMonth = subDays(new Date(), 30);
    const movies = await this.movieModel.find(
      {
        $or: [
          { $expr: { $lt: ["$indexedAt", "$updatedAt"] } },
          { indexedAt: { $lte: lastMonth } },
        ],
      },
      { original_title: 1, title: 1, tagline: 1, overview: 1 },
      { limit: 20 },
    );

    if (!movies.length) return;

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

    const moviesIds = movies.map((movie) => movie._id);
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

    console.info(`Updated indexedAt: ${moviesIds}`);
  }
}
