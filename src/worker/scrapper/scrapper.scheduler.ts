import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Queue } from "bull";
import { startOfDay, subDays } from "date-fns";
import { BRT, isProduction } from "src/constants";

@Injectable()
export class ScrapperScheduler {
  constructor(@InjectQueue("tmdb") private tmdbQueue: Queue) {}

  @Cron("0 0 12 * * *", { timeZone: BRT, disabled: !isProduction })
  async getChanges() {
    const today = startOfDay(new Date());
    const yesterday = subDays(today, 1);
    await this.tmdbQueue.add("getChanges", { date: yesterday, page: 1 });
  }
}
