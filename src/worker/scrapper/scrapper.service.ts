import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";
import { POPULAR_MOVIES_PAGES_LIMIT } from "src/constants";
import { addMongoId } from "src/mongo";
import { MovieRepository } from "src/movie/movie.repository";
import { SeriesRepository } from "src/series/series.repository";
import { TmdbAdapter } from "./tmdb.adapter";

@Injectable()
export class ScrapperService {
  constructor(
    private tmdbAdapter: TmdbAdapter,
    @InjectQueue("tmdb") private tmdbQueue: Queue,
    private movieRepository: MovieRepository,
    private seriesRepository: SeriesRepository,
  ) {}

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

  async getMovieDetails(id: number) {
    const movie = await this.tmdbAdapter.getMovieDetails(id);
    await this.movieRepository.saveMovie(movie);
  }

  async getSeriesDetails(id: number) {
    const series = await this.tmdbAdapter.getSeriesDetails(id);
    const seriesWithId = addMongoId(series, series.id);
    await this.seriesRepository.saveSeries(seriesWithId);
  }
}
