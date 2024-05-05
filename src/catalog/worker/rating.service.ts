import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { RatingService } from "src/rating/rating.service";
import { CatalogItem } from "../item.schema";

@Injectable()
export class CatalogRatingService {
  constructor(
    @InjectModel(CatalogItem.name) private catalogModel: Model<CatalogItem>,
    private ratingService: RatingService,
  ) {}

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
}
