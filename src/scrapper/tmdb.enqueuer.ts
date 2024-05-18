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
}
