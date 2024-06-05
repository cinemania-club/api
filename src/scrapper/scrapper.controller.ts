import { InjectQueue } from "@nestjs/bull";
import { Body, Controller, Post } from "@nestjs/common";
import { Queue } from "bull";
import { Admin } from "src/auth/auth.guard";
import { ProcessorType } from "src/processor";

@Admin()
@Controller("/scrapper")
export class ScrapperController {
  constructor(@InjectQueue(ProcessorType.TMDB) private tmdbQueue: Queue) {}

  @Post("/get-movie")
  async getMovie(@Body("id") id: number) {
    console.info(`Scrapping movie: ${id}`);
    await this.tmdbQueue.add("getMovieDetails", { id });
  }

  @Post("/get-series")
  async getSeries(@Body("id") id: number) {
    console.info(`Scrapping series: ${id}`);
    await this.tmdbQueue.add("getSeriesDetails", { id });
  }
}
