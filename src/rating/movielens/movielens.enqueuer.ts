import { InjectQueue } from "@nestjs/bull";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Cron } from "@nestjs/schedule";
import { Queue } from "bull";
import { Cache } from "cache-manager";
import { Model } from "mongoose";
import { BRT, ENQUEUER_LIMIT } from "src/constants";
import { ENQUEUER } from "src/scheduler";
import { MovielensRating } from "./rating.schema";

const PROCESSOR = "movielens:load-ratings";

@Injectable()
export class MovielensEnqueuer {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectModel(MovielensRating.name)
    private ratingModel: Model<MovielensRating>,
    @InjectQueue("movielens") private movielensQueue: Queue,
  ) {}

  @Cron(ENQUEUER, { timeZone: BRT, disabled: false })
  async enqueue() {
    console.log("a");
    const enqueueId = await this.cacheManager.get(PROCESSOR);
    if (!enqueueId) return;

    console.info("Enqueuing movielens ratings");
    const ratings = await this.ratingModel.find(
      { enqueueId: { $ne: enqueueId } },
      { _id: 1 },
      { limit: ENQUEUER_LIMIT },
    );

    const ids = ratings.map((rating) => rating._id);
    const jobs = ids.map((id) => ({
      name: "load-ratings",
      data: { id },
    }));

    if (!ids.length) {
      console.info("Movielens: no ratings to enqueue");
      this.cacheManager.del(PROCESSOR);
      return;
    }

    console.info(`Movielens: enqueueing ${jobs.length} jobs`);
    await this.movielensQueue.addBulk(jobs);

    console.info(`Movielens: updating ${ids.length} ratings`);
    await this.ratingModel.updateMany({ _id: ids }, { enqueueId });
  }
}
