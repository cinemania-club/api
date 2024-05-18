import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";

export class TmdbEnqueuer {
  constructor(@InjectQueue("tmdb") private tmdbQueue: Queue) {}

  async enqueuePopularMovies(pages: number[]) {
    const jobs = pages.map((page) => ({
      name: "getPopularMovies",
      data: { page },
    }));

    await this.tmdbQueue.addBulk(jobs);
  }

  async enqueueMovieDetails(id: number) {
    await this.tmdbQueue.add("getMovieDetails", { id });
  }

  async enqueuePopularSeries(pages: number[]) {
    const jobs = pages.map((page) => ({
      name: "getPopularSeries",
      data: { page },
    }));

    await this.tmdbQueue.addBulk(jobs);
  }

  async enqueueSeriesDetails(id: number) {
    await this.tmdbQueue.add("getSeriesDetails", { id });
  }

  async flush() {
    await this.tmdbQueue.empty();
  }
}
