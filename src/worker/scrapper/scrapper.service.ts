import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";
import { POPULAR_MOVIES_PAGES_LIMIT } from "src/constants";
import { MovieService } from "src/movie/movie.service";
import { SeriesService } from "src/series/series.service";
import { TmdbAdapter } from "./tmdb.adapter";

@Injectable()
export class ScrapperService {
  constructor(
    private tmdbAdapter: TmdbAdapter,
    @InjectQueue("tmdb") private tmdbQueue: Queue,
    private seriesService: SeriesService,
    private movieService: MovieService,
  ) {}

  async getPopularMovies(page: number) {
    const movies = await this.tmdbAdapter.getPopularMovies(page);

    const movieIds = movies.results.map((m) => m.id);
    const moviesToReload = await this.movieService.getOutdated(movieIds);

    const jobs = moviesToReload.map((id) => ({
      name: "getMovieDetails",
      data: { id },
    }));

    await this.tmdbQueue.addBulk(jobs);
    if (
      movies.page < movies.total_pages &&
      movies.page < POPULAR_MOVIES_PAGES_LIMIT
    ) {
      this.tmdbQueue.add("getPopularMovies", { page: movies.page + 1 });
    }

    return movies;
  }

  async getMovieDetails(id: number) {
    const movie = await this.tmdbAdapter.getMovieDetails(id);
    await this.movieService.saveMovie(movie);
  }

  async getSeriesDetails(id: number) {
    const series = await this.tmdbAdapter.getSeriesDetails(id);
    await this.seriesService.saveSeries(series);
  }
}
