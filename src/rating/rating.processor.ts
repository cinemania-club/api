import { InjectQueue, Process, Processor } from "@nestjs/bull";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Queue } from "bull";
import { Cache } from "cache-manager";
import { Model } from "mongoose";
import { CatalogItem } from "src/catalog/item.schema";
import { BaseProcessor, ProcessorType, ProcessType } from "../processor";
import { RatingService } from "./rating.service";

const PROCESSOR = ProcessorType.RATING + ":" + ProcessType.CALCULATE_RATINGS;

@Processor(ProcessorType.RATING)
export class RatingProcessor extends BaseProcessor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectModel(CatalogItem.name) private catalogModel: Model<CatalogItem>,
    private ratingService: RatingService,
    @InjectQueue(ProcessorType.RATING) private ratingQueue: Queue,
  ) {
    super();
  }

  @Process(ProcessType.CALCULATE_RATINGS)
  async calculateRatings() {
    const processId = await this.cacheManager.get(PROCESSOR);
    if (!processId) return;

    await this.ratingQueue.add(ProcessType.CALCULATE_RATINGS);

    const item = await this.catalogModel.findOneAndUpdate(
      { ratingProcessId: { $ne: processId } },
      { $set: { ratingProcessId: processId } },
      { new: true },
    );

    if (!item) {
      console.info(`No more ratings to calculate: ${processId}`);
      this.cacheManager.del(PROCESSOR);
      return;
    }

    const rating = this.ratingService.calculateRating(item);

    await this.catalogModel.findByIdAndUpdate(item._id, { rating });

    console.info(`Movielens rating loaded. Process: ${processId}`);
  }
}
