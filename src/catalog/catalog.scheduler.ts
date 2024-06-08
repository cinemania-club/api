import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Queue } from "bull";
import { BRT, isProduction } from "src/constants";
import { ProcessorType, ProcessType } from "src/processor";
import { CALCULATE_RATINGS } from "src/scheduler";

@Injectable()
export class CatalogScheduler {
  constructor(
    @InjectQueue(ProcessorType.RATING) private catalogRatingQueue: Queue,
  ) {}

  @Cron(CALCULATE_RATINGS, { timeZone: BRT, disabled: !isProduction })
  async calculateRatings() {
    await this.catalogRatingQueue.add(ProcessType.CALCULATE_RATINGS);
  }
}
