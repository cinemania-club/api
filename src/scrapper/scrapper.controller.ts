import { InjectQueue } from "@nestjs/bull";
import { Body, Controller, Post } from "@nestjs/common";
import { Queue } from "bull";
import { first, last, range } from "lodash";
import { Admin } from "src/auth/auth.guard";
import { ProcessorType } from "src/processor";
import { POPULAR_ITEMS_PAGES_LIMIT } from "./constants";

@Admin()
@Controller("/scrapper")
export class ScrapperController {
  constructor(@InjectQueue(ProcessorType.TMDB) private tmdbQueue: Queue) {}

  @Post("/get-popular-movies")
  async getPopularMovies() {
    const pages = range(1, POPULAR_ITEMS_PAGES_LIMIT + 1);
    const firstPage = first(pages);
    const lastPage = last(pages);

    console.info(
      `Scrapping popular movies. First: ${firstPage}, last: ${lastPage}`,
    );

    const jobs = pages.map((page) => ({
      name: "getPopularMovies",
      data: { page },
    }));

    await this.tmdbQueue.addBulk(jobs);
  }

  @Post("/get-movie")
  async getMovie(@Body("id") id: number) {
    console.info(`Scrapping movie: ${id}`);
    await this.tmdbQueue.add("getMovieDetails", { id });
  }

  @Post("/get-popular-series")
  async getPopularSeries() {
    const pages = range(1, POPULAR_ITEMS_PAGES_LIMIT + 1);
    const firstPage = first(pages);
    const lastPage = last(pages);

    console.info(
      `Scrapping popular series. First: ${firstPage}, last: ${lastPage}`,
    );

    const jobs = pages.map((page) => ({
      name: "getPopularSeries",
      data: { page },
    }));

    await this.tmdbQueue.addBulk(jobs);
  }

  @Post("/get-series")
  async getSeries(@Body("id") id: number) {
    console.info(`Scrapping series: ${id}`);
    await this.tmdbQueue.add("getSeriesDetails", { id });
  }

  @Post("/flush")
  async flush() {
    console.info(`Flush scrapper`);
    await this.tmdbQueue.empty();
  }
}
