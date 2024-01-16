import { InjectQueue } from "@nestjs/bull";
import { Body, Controller, Post } from "@nestjs/common";
import { Queue } from "bull";
import { ScrapperScheduler } from "src/worker/scrapper/scrapper.scheduler";

@Controller("/admin")
export class AdminController {
  constructor(
    @InjectQueue("tmdb") private tmdbQueue: Queue,
    private scrapperScheduler: ScrapperScheduler,
  ) {}

  @Post("/get-changes")
  getChanges() {
    console.info(`[Admin] Processing changes`);
    this.scrapperScheduler.getChanges();
  }

  @Post("/get-movie")
  async getMovie(@Body("id") id: number) {
    console.info(`[Admin] Enqueuing movie with id ${id}`);
    await this.tmdbQueue.add("getMovieDetails", { id });
  }
}
