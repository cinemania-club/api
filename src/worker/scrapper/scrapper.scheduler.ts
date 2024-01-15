import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Queue } from "bull";
import { startOfDay, subDays } from "date-fns";

@Injectable()
export class ScrapperScheduler {
  constructor(@InjectQueue("tmdb") private tmdbQueue: Queue) {}

  @Cron("0 0 15 * * *", { disabled: process.env.NODE_ENV !== "production" })
  getChanges() {
    const today = startOfDay(new Date());
    const yesterday = subDays(today, 1);
    this.tmdbQueue.add("getChanges", { date: yesterday, page: 1 });
  }
}
