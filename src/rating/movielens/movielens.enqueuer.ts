import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { BRT, isProduction } from "src/constants";
import { ENQUEUER } from "src/scheduler";

@Injectable()
export class MovielensEnqueuer {
  constructor() {}

  @Cron(ENQUEUER, { timeZone: BRT, disabled: !isProduction })
  async enqueue() {}
}
