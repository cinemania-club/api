import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Queue } from "bull";
import { Model } from "mongoose";
import { POPULAR_MOVIES_PAGES_LIMIT } from "src/constants";
import { addMongoId } from "src/mongo";
import { Movie } from "src/movie/movie.schema";
import { SeriesRepository } from "src/series/series.repository";
import { TmdbAdapter } from "./tmdb.adapter";

@Injectable()
export class ScrapperService {
  constructor(
    private tmdbAdapter: TmdbAdapter,
    @InjectQueue("tmdb") private tmdbQueue: Queue,
    @InjectModel(Movie.name) private movieModel: Model<Movie>,
    private seriesRepository: SeriesRepository,
  ) {}

  async getTopRated(page: number) {
    const movies = await this.tmdbAdapter.getTopRated(page);

    const jobs = movies.results.map((movie) => ({
      name: "getMovieDetails",
      data: { id: movie.id },
    }));

    await this.tmdbQueue.addBulk(jobs);
    if (movies.page < movies.total_pages) {
      this.tmdbQueue.add("getTopRated", { page: movies.page + 1 });
    }

    return movies;
  }

  async getPopular(page: number) {
    const movies = await this.tmdbAdapter.getPopular(page);

    const jobs = movies.results.map((movie) => ({
      name: "getMovieDetails",
      data: { id: movie.id },
    }));

    await this.tmdbQueue.addBulk(jobs);
    if (
      movies.page < movies.total_pages &&
      movies.page < POPULAR_MOVIES_PAGES_LIMIT
    ) {
      this.tmdbQueue.add("getPopular", { page: movies.page + 1 });
    }

    return movies;
  }

  async getChanges(date: Date, page: number) {
    const changes = await this.tmdbAdapter.getChanges(date, page);

    const jobs = changes.results.map((movie) => ({
      name: "getMovieDetails",
      data: { id: movie.id },
    }));

    await this.tmdbQueue.addBulk(jobs);
    if (changes.page < changes.total_pages) {
      this.tmdbQueue.add("getChanges", { date, page: changes.page + 1 });
    }

    return changes;
  }

  async getMovieDetails(id: number) {
    const movie = await this.tmdbAdapter.getMovieDetails(id);

    const movieWithId = addMongoId(movie, movie.id);
    await this.movieModel.updateOne({ _id: id }, movieWithId, { upsert: true });
  }

  async getSeriesDetails(id: number) {
    const series = await this.tmdbAdapter.getSeriesDetails(id);
    const seriesWithId = addMongoId(series, series.id);
    this.seriesRepository.saveSeries(seriesWithId);
  }
}
