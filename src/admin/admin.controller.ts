import { InjectQueue } from "@nestjs/bull";
import { Body, Controller, Get, Post } from "@nestjs/common";
import { Queue } from "bull";
import { ScrapperScheduler } from "src/worker/scrapper/scrapper.scheduler";

@Controller("/admin/scrapper")
export class AdminController {
  constructor(
    @InjectQueue("tmdb") private tmdbQueue: Queue,
    private scrapperScheduler: ScrapperScheduler,
  ) {}

  @Get("/get-movies")
  async getMovies() {
    return [
      {
        id: "123",
        title: "Oppenheimer",
        releaseYear: 1999,
        duration: 180,
        grade: 2.5,
        genres: ["Comédia", "Romance"],
      },
      {
        id: "456",
        title: "Titanic",
        releaseYear: 2012,
        duration: 120,
        grade: 4.53,
        genres: ["Comédia"],
      },
    ];
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
