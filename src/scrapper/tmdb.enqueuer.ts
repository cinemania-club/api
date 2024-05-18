import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { first, last, range } from "lodash";
import { POPULAR_ITEMS_PAGES_LIMIT } from "./constants";

export class TmdbEnqueuer {
  constructor(@InjectQueue("tmdb") private tmdbQueue: Queue) {}

  async enqueuePopularMovies() {
    const pages = range(1, POPULAR_ITEMS_PAGES_LIMIT + 1);
    const firstPage = first(pages);
    const lastPage = last(pages);

    console.info(
      `Enqueueing popular movies. First: ${firstPage}, last: ${lastPage}`,
    );

    const jobs = pages.map((page) => ({
      name: "getPopularMovies",
      data: { page },
    }));

    await this.tmdbQueue.addBulk(jobs);
  }

  async enqueueMovieDetails(ids: number[]) {
    console.info(`Enqueueing movie details: ${ids.join(",")}`);

    const jobs = ids.map((id) => ({
      name: "getMovieDetails",
      data: { id },
    }));

    await this.tmdbQueue.addBulk(jobs);
  }

  async enqueuePopularSeries() {
    const pages = range(1, POPULAR_ITEMS_PAGES_LIMIT + 1);
    const firstPage = first(pages);
    const lastPage = last(pages);

    console.info(
      `Enqueueing popular series. First: ${firstPage}, last: ${lastPage}`,
    );

    const jobs = pages.map((page) => ({
      name: "getPopularSeries",
      data: { page },
    }));

    await this.tmdbQueue.addBulk(jobs);
  }

  async enqueueSeriesDetails(ids: number[]) {
    console.info(`Enqueueing series details: ${ids.join(",")}`);

    const jobs = ids.map((id) => ({
      name: "getSeriesDetails",
      data: { id },
    }));

    await this.tmdbQueue.addBulk(jobs);
  }

  async flush() {
    console.info(`Flushing tmdb queue`);
    await this.tmdbQueue.empty();
  }
}
