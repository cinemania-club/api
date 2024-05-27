import { InjectQueue, Process, Processor } from "@nestjs/bull";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Queue } from "bull";
import { Cache } from "cache-manager";
import { Model } from "mongoose";
import { BaseProcessor } from "src/processor";
import { Rating, RatingSource } from "../rating.schema";
import { MovielensLink } from "./link.schema";
import { MovielensRating } from "./rating.schema";

const PROCESSOR = "movielens:load-ratings";

@Processor("movielens")
export class MovielensProcessor extends BaseProcessor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectQueue("movielens") private movielensQueue: Queue,
    @InjectModel(MovielensRating.name)
    private mlRatingModel: Model<MovielensRating>,
    @InjectModel(MovielensLink.name)
    private mlLinkModel: Model<MovielensLink>,
    @InjectModel(Rating.name)
    private ratingModel: Model<Rating>,
  ) {
    super();
  }

  @Process("load-ratings")
  async loadRatings() {
    const processId = await this.cacheManager.get(PROCESSOR);
    if (!processId) return;

    await this.movielensQueue.add("load-ratings");

    const rating = await this.mlRatingModel.findOneAndUpdate(
      { processId: { $ne: processId } },
      { $set: { processId } },
      { new: true },
    );

    if (!rating) {
      this.cacheManager.del(PROCESSOR);
      return;
    }

    const link = await this.mlLinkModel.findOne({ movieId: rating?.movieId });
    if (!link) return;

    await this.ratingModel.findOneAndUpdate(
      {
        source: RatingSource.MOVIELENS,
        userId: rating.userId,
        itemId: link.tmdbId,
      },
      { $set: { stars: rating.rating } },
      { upsert: true },
    );

    console.info(`Movielens rating loaded. Process: ${processId}`);
  }
}
