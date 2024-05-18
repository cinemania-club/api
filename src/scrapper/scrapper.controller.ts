import { Body, Controller, Post } from "@nestjs/common";
import { Admin } from "src/auth/auth.guard";
import { TmdbEnqueuer } from "./tmdb.enqueuer";

@Admin()
@Controller("/scrapper")
export class ScrapperController {
  constructor(private tmdbEnqueuer: TmdbEnqueuer) {}

  @Post("/get-popular-movies")
  async getPopularMovies() {
    await this.tmdbEnqueuer.enqueuePopularMovies();
  }

  @Post("/get-movie")
  async getMovie(@Body("id") id: number) {
    await this.tmdbEnqueuer.enqueueMovieDetails([id]);
  }

  @Post("/get-popular-series")
  async getPopularSeries() {
    await this.tmdbEnqueuer.enqueuePopularSeries();
  }

  @Post("/get-series")
  async getSeries(@Body("id") id: number) {
    await this.tmdbEnqueuer.enqueueSeriesDetails([id]);
  }

  @Post("/flush")
  async flush() {
    await this.tmdbEnqueuer.flush();
  }
}
