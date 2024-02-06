import { InjectQueue } from "@nestjs/bull";
import { Body, Controller, Get, Post } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Queue } from "bull";
import { Model } from "mongoose";
import { Movie } from "src/movie/movie.schema";
import { ScrapperScheduler } from "src/worker/scrapper/scrapper.scheduler";

@Controller("/admin/scrapper")
export class AdminController {
  constructor(
    @InjectQueue("tmdb") private tmdbQueue: Queue,
    @InjectModel(Movie.name) private movieModel: Model<Movie>,
    private scrapperScheduler: ScrapperScheduler,
  ) {}

  @Get("/get-movies")
  async getMovies() {
    return this.movieModel.find();
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
