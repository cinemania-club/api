import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { sum } from "lodash";
import { Model } from "mongoose";
import { CatalogItem } from "src/catalog/item.schema";
import { $eq, Oid } from "src/mongo";
import { Rating } from "./rating.schema";
import { normalizeRating } from "./util";

type RatingSource = {
  _id: Oid;
  rating: number;
  count: number;
};

type RatingAvg = {
  rating: number;
  count: number;
};

@Injectable()
export class RatingService {
  constructor(@InjectModel(Rating.name) private ratingModel: Model<Rating>) {}

  async calculateRating(item: CatalogItem) {
    const internal = await this.getInternalRatingAvg(item);
    const tmdb = this.getTmdbRatingAvg(item);

    return this.joinRatingAvgs(internal, tmdb);
  }

  private async getInternalRatingAvg(item: CatalogItem) {
    const [rating] = await this.ratingModel.aggregate<RatingAvg>([
      { $match: { itemId: item._id } },
      {
        $group: {
          _id: "$itemId",
          stars: { $sum: "$stars" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          rating: { $divide: ["$stars", "$count"] },
          count: 1,
        },
      },
    ]);

    return rating;
  }

  private getTmdbRatingAvg(item: CatalogItem) {
    return {
      rating: normalizeRating(item.voteAverage, 0.5, 10),
      count: item.voteCount,
    };
  }

  private joinRatingAvgs(...ratingAvgs: RatingAvg[]) {
    const ratings = sum(ratingAvgs.map((e) => e.rating * e.count));
    const count = sum(ratingAvgs.map((e) => e.count));
    return ratings / count;
  }

  async calculateRatings(externalSource: RatingSource[]) {
    const ids = externalSource.map((item) => item._id);

    const internalSource = await this.ratingModel.aggregate<RatingSource>([
      { $match: { itemId: { $in: ids } } },
      {
        $group: {
          _id: "$itemId",
          stars: { $sum: "$stars" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 1,
          rating: { $divide: ["$stars", "$count"] },
          count: 1,
        },
      },
    ]);

    const ratings = externalSource.map((external) => {
      const internal = internalSource.find((e) => $eq(e._id, external._id));

      return {
        _id: external._id,
        rating: this.weightedRating(external, internal),
      };
    });

    return ratings;
  }

  // PRIVATE METHODS

  private weightedRating(external: RatingSource, internal?: RatingSource) {
    const normalizedRating = normalizeRating(external.rating, 0.5, 10);
    if (!internal) return normalizedRating;

    const internalFactor = internal.count * internal.rating;
    const externalFactor = external.count * normalizedRating;
    const total = internal.count + external.count;

    return (internalFactor + externalFactor) / total;
  }
}
