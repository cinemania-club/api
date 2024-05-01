import { InjectQueue } from "@nestjs/bull";
import { Body, Controller, Post } from "@nestjs/common";
import { Queue } from "bull";
import { Admin } from "src/auth/auth.guard";

@Admin()
@Controller("/admin/scrapper")
export class ScrapperController {
  constructor(@InjectQueue("tmdb") private tmdbQueue: Queue) {}

  @Post("/get-popular-movies")
  async getPopularMovies() {
    console.info(`[Admin] Processing popular movies`);
    await this.tmdbQueue.add("getPopularMovies", { page: 1 });
  }

  @Post("/get-movie")
  async getMovie(@Body("id") id: number) {
    console.info(`[Admin] Enqueuing movie with id ${id}`);
    await this.tmdbQueue.add("getMovieDetails", { id });
  }

  @Post("/get-series")
  async getSeries(@Body("id") id: number) {
    console.info(`[Admin] Enqueuing series with id ${id}`);
    await this.tmdbQueue.add("getSeriesDetails", { id });
  }

  @Post("/flush")
  flush() {
    console.info(`[Admin] Flush TMDB queue`);
    this.tmdbQueue.empty();
  }
}
