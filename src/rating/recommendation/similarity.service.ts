import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { pick } from "lodash";
import { Model } from "mongoose";
import { Critic } from "../critic.schema";
import { Rating } from "../rating.schema";

@Injectable()
export class SimilarityService {
  constructor(@InjectModel(Rating.name) private ratingModel: Model<Rating>) {}

  async calculateSimilarity(critic1: Critic, critic2: Critic) {
    const items = await this.getIntersectionItems(critic1, critic2);
    console.log({ items: JSON.stringify(items) });
  }

  private async getIntersectionItems(critic1: Critic, critic2: Critic) {
    const c1 = pick(critic1, ["source", "userId"]);
    const c2 = pick(critic2, ["source", "userId"]);

    const result = await this.ratingModel.aggregate([
      { $match: { $or: [c1, c2] } },
      {
        $group: {
          _id: "$itemId",
          ratings: {
            $addToSet: {
              source: "$source",
              userId: "$userId",
              stars: "$stars",
            },
          },
        },
      },
      {
        $match: {
          ratings: {
            $all: [{ $elemMatch: c1 }, { $elemMatch: c2 }],
          },
        },
      },
      {
        $project: {
          critic1: {
            $first: {
              $filter: {
                input: "$ratings",
                cond: {
                  $and: [
                    { $eq: ["$$this.source", c1.source] },
                    { $eq: ["$$this.userId", c1.userId] },
                  ],
                },
              },
            },
          },
          critic2: {
            $first: {
              $filter: {
                input: "$ratings",
                cond: {
                  $and: [
                    { $eq: ["$$this.source", c2.source] },
                    { $eq: ["$$this.userId", c2.userId] },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          itemId: "$_id",
          critic1: "$critic1.stars",
          critic2: "$critic1.stars",
        },
      },
    ]);

    return result;
  }
}
