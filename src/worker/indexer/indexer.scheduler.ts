import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { BRT, isProduction } from "src/constants";
import { IndexerService } from "./indexer.service";

@Injectable()
export class IndexerScheduler {
  constructor(private movieService: IndexerService) {}

  @Cron("*/30 * * * * *", { timeZone: BRT, disabled: !isProduction })
  async indexMovies() {
    this.movieService.indexMovies();
  }
}
