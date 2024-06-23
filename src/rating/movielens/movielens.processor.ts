import { InjectQueue, Process, Processor } from "@nestjs/bull";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Queue } from "bull";
import { Cache } from "cache-manager";
import { Model } from "mongoose";
import { CatalogItem } from "src/catalog/item.schema";
import { BaseProcessor, ProcessorType, ProcessType } from "src/processor";
import { DataSource } from "src/types";
import { Rating } from "../rating.schema";
import { MovielensLink } from "./link.schema";
import { MovielensRating } from "./rating.schema";

const PROCESSOR = ProcessorType.MOVIELENS + ":" + ProcessType.LOAD_RATINGS;

@Processor(ProcessorType.MOVIELENS)
export class MovielensProcessor extends BaseProcessor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectQueue(ProcessorType.MOVIELENS) private movielensQueue: Queue,
    @InjectModel(MovielensRating.name)
    private mlRatingModel: Model<MovielensRating>,
    @InjectModel(MovielensLink.name) private mlLinkModel: Model<MovielensLink>,
    @InjectModel(CatalogItem.name) private itemModel: Model<CatalogItem>,
    @InjectModel(Rating.name) private ratingModel: Model<Rating>,
  ) {
    super();
  }

  @Process(ProcessType.LOAD_RATINGS)
  async loadRatings() {
    const processId = await this.cacheManager.get(PROCESSOR);
    if (!processId) return;

    await this.movielensQueue.add(ProcessType.LOAD_RATINGS);

    const rating = await this.mlRatingModel.findOneAndUpdate(
      { processId: { $ne: processId } },
      { $set: { processId } },
      { new: true },
    );

    if (!rating) {
      console.info(`No more Movielens ratings to load: ${processId}`);
      this.cacheManager.del(PROCESSOR);
      return;
    }

    const link = await this.mlLinkModel.findOne({ movieId: rating.movieId });
    if (!link) {
      console.info(`Link not found: ${rating.movieId}, ${processId}`);
      return;
    }

    const item = await this.itemModel.findOne({ id: link.tmdbId }, { _id: 1 });
    if (!item) {
      console.info(
        `Item not found: ${link.tmdbId}, ${rating.movieId}, ${processId}`,
      );
      return;
    }

    await this.ratingModel.findOneAndUpdate(
      {
        source: DataSource.MOVIELENS,
        userId: rating.userId,
        itemId: item._id,
      },
      { $set: { stars: rating.rating } },
      { upsert: true },
    );

    console.info(`Movielens rating loaded. Process: ${processId}`);
  }
}
