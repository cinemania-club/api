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

  async enqueueMovieDetails(ids: number[]) {
    const jobs = ids.map((id) => ({
      name: "getMovieDetails",
      data: { id },
    }));

    await this.tmdbQueue.addBulk(jobs);
  }

  async enqueuePopularSeries(pages: number[]) {
    const jobs = pages.map((page) => ({
      name: "getPopularSeries",
      data: { page },
    }));

    await this.tmdbQueue.addBulk(jobs);
  }

  async enqueueSeriesDetails(ids: number[]) {
    const jobs = ids.map((id) => ({
      name: "getSeriesDetails",
      data: { id },
    }));

    await this.tmdbQueue.addBulk(jobs);
  }

  async flush() {
    await this.tmdbQueue.empty();
  }
}
