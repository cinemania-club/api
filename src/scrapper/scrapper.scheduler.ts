import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { BRT, isProduction } from "src/constants";
import { GET_POPULAR_MOVIES, GET_POPULAR_SERIES } from "../scheduler";
import { TmdbEnqueuer } from "./tmdb.enqueuer";

@Injectable()
export class ScrapperScheduler {
  constructor(private tmdbEnqueuer: TmdbEnqueuer) {}

  @Cron(GET_POPULAR_MOVIES, { timeZone: BRT, disabled: !isProduction })
  async getPopularMovies() {
    await this.tmdbEnqueuer.enqueuePopularMovies();
  }

  @Cron(GET_POPULAR_SERIES, { timeZone: BRT, disabled: !isProduction })
  async getPopularSeries() {
    await this.tmdbEnqueuer.enqueuePopularSeries();
  }
}
