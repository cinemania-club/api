import { Process, Processor } from "@nestjs/bull";
import { InjectModel } from "@nestjs/mongoose";
import { Job } from "bull";
import { Model } from "mongoose";
import { CatalogItem } from "src/catalog/item.schema";
import { BaseProcessor, ProcessorType, ProcessType } from "../processor";
import { RatingService } from "./rating.service";

@Processor(ProcessorType.RATING)
export class RatingProcessor extends BaseProcessor {
  constructor(
    @InjectModel(CatalogItem.name) private catalogModel: Model<CatalogItem>,
    private ratingService: RatingService,
  ) {
    super();
  }

  @Process(ProcessType.CALCULATE_RATINGS)
  async calculateRatings() {
    const items = await this.catalogModel.find({});

    const ids = items.map((item) => item.id).join(",");
    console.info(`Calculating ratings for items: ${ids}`);

    const tmdbRatings = items.map((item) => ({
      _id: item._id,
      rating: item.voteAverage,
      count: item.voteCount,
    }));
    const ratings = await this.ratingService.calculateRatings(tmdbRatings);

    await this.catalogModel.bulkWrite(
      ratings.map((rating) => ({
        updateOne: {
          filter: { _id: rating._id },
          update: { $set: { rating: rating.rating } },
        },
      })),
    );

    console.info(`Updated ratings for items: ${ids}`);
  }

  @Process(ProcessType.CALCULATE_RATING)
  async calculateRating(job: Job<{ id: string }>) {
    const item = await this.catalogModel.findById(job.data.id);
    if (!item) {
      console.info(`Item not found: ${job.data.id}`);
      return;
    }

    const rating = await this.ratingService.calculateRating(item);

    await this.catalogModel.findByIdAndUpdate(item._id, { rating });
  }
}
