import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Queue } from "bull";
import { BRT, isProduction } from "src/constants";
import { GET_POPULAR_MOVIES, GET_POPULAR_SERIES } from "../scheduler";

@Injectable()
export class ScrapperScheduler {
  constructor(@InjectQueue("tmdb") private tmdbQueue: Queue) {}

  @Cron(GET_POPULAR_MOVIES, { timeZone: BRT, disabled: !isProduction })
  async getPopularMovies() {
    await this.tmdbQueue.add("getPopularMovies", { page: 1 });
  }

  @Cron(GET_POPULAR_SERIES, { timeZone: BRT, disabled: !isProduction })
  async getPopularSeries() {
    await this.tmdbQueue.add("getPopularSeries", { page: 1 });
  }
}
