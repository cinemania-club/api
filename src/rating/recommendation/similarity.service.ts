import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { pick } from "lodash";
import { Model } from "mongoose";
import { Oid } from "src/mongo";
import { Critic } from "../critic.schema";
import { Rating } from "../rating.schema";

@Injectable()
export class SimilarityService {
  constructor(@InjectModel(Rating.name) private ratingModel: Model<Rating>) {}

  async calculateSimilarity(critic1: Critic, critic2: Critic) {
    const items = await this.getIntersectionItems(critic1, critic2);
    console.log({ items });
  }

  private async getIntersectionItems(critic1: Critic, critic2: Critic) {
    const [result] = await this.ratingModel.aggregate<{ items: Oid[] }>([
      {
        $facet: {
          critic1: [{ $match: pick(critic1, ["source", "userId"]) }],
          critic2: [{ $match: pick(critic2, ["source", "userId"]) }],
        },
      },
      {
        $project: {
          items: { $setIntersection: ["$critic1.itemId", "$critic2.itemId"] },
        },
      },
    ]);

    return result.items;
  }
}
