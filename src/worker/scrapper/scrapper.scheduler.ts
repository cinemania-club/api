import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Queue } from "bull";
import { BRT, isProduction } from "src/constants";

@Injectable()
export class ScrapperScheduler {
  constructor(@InjectQueue("tmdb") private tmdbQueue: Queue) {}

  @Cron("0 0 0 * * *", { timeZone: BRT, disabled: !isProduction })
  async getPopularMovies() {
    await this.tmdbQueue.add("getPopularMovies", { page: 1 });
  }

  @Cron("0 0 0 * * *", { timeZone: BRT, disabled: !isProduction })
  async getPopularSeries() {
    await this.tmdbQueue.add("getPopularSeries", { page: 1 });
  }
}
