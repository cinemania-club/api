import { InjectQueue } from "@nestjs/bull";
import { Body, Controller, Post } from "@nestjs/common";
import { Queue } from "bull";
import { Admin } from "src/auth/auth.guard";
import { ScrapperScheduler } from "src/worker/scrapper/scrapper.scheduler";

@Admin()
@Controller("/admin/scrapper")
export class AdminController {
  constructor(
    @InjectQueue("tmdb") private tmdbQueue: Queue,
    private scrapperScheduler: ScrapperScheduler,
  ) {}

  @Post("/get-top-rated")
  async getTopRated() {
    console.info(`[Admin] Processing top rated movies`);
    await this.tmdbQueue.add("getTopRated", { page: 1 });
  }

  @Post("/get-changes")
  async getChanges() {
    console.info(`[Admin] Processing changes`);
    await this.scrapperScheduler.getChanges();
  }

  @Post("/get-movie")
  async getMovie(@Body("id") id: number) {
    console.info(`[Admin] Enqueuing movie with id ${id}`);
    await this.tmdbQueue.add("getMovieDetails", { id });
  }

  @Post("/flush")
  flush() {
    console.info(`[Admin] Flush TMDB queue`);
    this.tmdbQueue.empty();
  }
}
