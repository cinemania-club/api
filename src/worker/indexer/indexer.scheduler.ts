import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { BRT, isProduction } from "src/constants";
import { IndexerService } from "./indexer.service";

@Injectable()
export class IndexerScheduler {
  constructor(private indexerService: IndexerService) {}

  @Cron("*/30 * * * * *", { timeZone: BRT, disabled: !isProduction })
  async indexMovies() {
    this.indexerService.indexMovies();
  }

  @Cron("*/30 * * * * *", { timeZone: BRT, disabled: !isProduction })
  async indexSeries() {
    this.indexerService.indexSeries();
  }
}
