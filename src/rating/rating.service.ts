import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { $eq, Oid } from "src/mongo";
import { Rating } from "./rating.schema";

type RatingSource = {
  _id: Oid;
  rating: number;
  count: number;
};

@Injectable()
export class RatingService {
  constructor(@InjectModel(Rating.name) private ratingModel: Model<Rating>) {}

  async rateItem(userId: string, itemId: string, stars?: number) {
    await this.ratingModel.findOneAndUpdate(
      { itemId, userId },
      { stars: stars || null },
      { upsert: true },
    );
  }

  async countUserRatings(userId: Oid) {
    return await this.ratingModel.countDocuments({
      userId,
      stars: { $ne: null },
    });
  }

  async getUserRatings(itemIds: Oid[], userId: Oid) {
    return await this.ratingModel.find({
      userId,
      itemId: { $in: itemIds },
    });
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
    const normalizedRating = this.normalizeRating(external.rating);
    if (!internal) return normalizedRating;

    const internalFactor = internal.count * internal.rating;
    const externalFactor = external.count * normalizedRating;
    const total = internal.count + external.count;

    return (internalFactor + externalFactor) / total;
  }

  private normalizeRating(stars: number, min = 1, max = 10) {
    return (4 * (stars - min)) / (max - min) + 1;
  }
}