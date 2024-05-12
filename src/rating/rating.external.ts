import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { pick } from "lodash";
import { Model } from "mongoose";
import { CATALOG_FIELDS } from "src/catalog/constants";
import { CatalogHydration } from "src/catalog/hydration/hydration.service";
import { Oid } from "src/mongo";
import { Rating } from "./rating.schema";

@Injectable()
export class RatingExternal {
  constructor(
    @InjectModel(Rating.name) private ratingModel: Model<Rating>,
    private catalogHydration: CatalogHydration,
  ) {}

  async getHighRatedItems(userId: Oid) {
    return await this.getItemsWithRates(userId, [4, 5]);
  }

  async getLowRatedItems(userId: Oid) {
    return await this.getItemsWithRates(userId, [1, 2]);
  }

  private async getItemsWithRates(userId: Oid, stars: number[]) {
    const ids = await this.ratingModel.find(
      { userId, stars: { $in: stars } },
      { itemId: 1 },
      { sort: { updatedAt: -1 } },
    );

    const oids = ids.map((id) => id.itemId);
    const items = await this.catalogHydration.hydrateItems(oids, userId);
    return items.map((e) => pick(e, CATALOG_FIELDS));
  }
}
