import { Body, Controller, Post } from "@nestjs/common";
import { first, last, range } from "lodash";
import { Admin } from "src/auth/auth.guard";
import { POPULAR_ITEMS_PAGES_LIMIT } from "./constants";
import { TmdbEnqueuer } from "./tmdb.enqueuer";

@Admin()
@Controller("/scrapper")
export class ScrapperController {
  constructor(private tmdbEnqueuer: TmdbEnqueuer) {}

  @Post("/get-popular-movies")
  async getPopularMovies() {
    const pages = range(1, POPULAR_ITEMS_PAGES_LIMIT + 1);
    const firstPage = first(pages);
    const lastPage = last(pages);

    console.info(
      `Scrapping popular movies. First: ${firstPage}, last: ${lastPage}`,
    );

    await this.tmdbEnqueuer.enqueuePopularMovies(pages);
  }

  @Post("/get-movie")
  async getMovie(@Body("id") id: number) {
    console.info(`Scrapping movie: ${id}`);
    await this.tmdbEnqueuer.enqueueMovieDetails(id);
  }

  @Post("/get-popular-series")
  async getPopularSeries() {
    const pages = range(1, POPULAR_ITEMS_PAGES_LIMIT + 1);
    const firstPage = first(pages);
    const lastPage = last(pages);

    console.info(
      `Scrapping popular series. First: ${firstPage}, last: ${lastPage}`,
    );

    await this.tmdbEnqueuer.enqueuePopularSeries(pages);
  }

  @Post("/get-series")
  async getSeries(@Body("id") id: number) {
    console.info(`Scrapping series: ${id}`);
    await this.tmdbEnqueuer.enqueueSeriesDetails(id);
  }

  @Post("/flush")
  async flush() {
    console.info(`Flush scrapper`);
    await this.tmdbEnqueuer.flush();
  }
}
