import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Queue } from "bull";
import { BRT, isProduction } from "src/constants";
import { CALCULATE_RATINGS } from "src/worker/scheduler";

@Injectable()
export class CatalogScheduler {
  constructor(
    @InjectQueue("catalogRating") private catalogRatingQueue: Queue,
  ) {}

  @Cron(CALCULATE_RATINGS, { timeZone: BRT, disabled: !isProduction })
  async calculateRatings() {
    await this.catalogRatingQueue.add("calculateRatings");
  }
}
