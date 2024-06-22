import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { meanBy, pick } from "lodash";
import { Model } from "mongoose";
import { Oid } from "src/mongo";
import { Critic } from "../critic.schema";
import { Rating } from "../rating.schema";

type IntersectionRating = {
  itemId: Oid;
  critic1: number;
  critic2: number;
};

@Injectable()
export class SimilarityService {
  constructor(@InjectModel(Rating.name) private ratingModel: Model<Rating>) {}

  async calculateSimilarity(critic1: Critic, critic2: Critic) {
    let ratings = await this.getIntersectionRatings(critic1, critic2);
    ratings = await this.normalize(ratings);

    console.log({ ratings: JSON.stringify(ratings) });
  }

  private async getIntersectionRatings(critic1: Critic, critic2: Critic) {
    const c1 = pick(critic1, ["source", "userId"]);
    const c2 = pick(critic2, ["source", "userId"]);

    const result = await this.ratingModel.aggregate<IntersectionRating>([
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

  private async normalize(ratings: IntersectionRating[]) {
    const avgCritic1 = meanBy(ratings, "critic1");
    const avgCritic2 = meanBy(ratings, "critic2");

    return ratings.map((e) => ({
      ...e,
      critic1: e.critic1 - avgCritic1,
      critic2: e.critic2 - avgCritic2,
    }));
  }
}
