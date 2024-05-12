import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { $eq, Oid } from "src/mongo";
import { RatingService } from "src/rating/rating.service";
import { CatalogItem } from "./item.schema";

@Injectable()
export class CatalogExternal {
  constructor(
    @InjectModel(CatalogItem.name) private catalogModel: Model<CatalogItem>,
    private ratingService: RatingService,
  ) {}

  async hydrateItems(itemIds: Oid[], userId: Oid) {
    const items = await this.catalogModel
      .find({ _id: { $in: itemIds } })
      .lean();

    const result = itemIds
      .map((id) => items.find((e) => $eq(e._id, id)))
      .filter((e) => e) as CatalogItem[];

    return await this.addRatings(result, userId);
  }

  // PRIVATE METHODS

  private async addRatings(items: CatalogItem[], userId: Oid) {
    const ids = items.map((item) => item._id);
    const ratings = await this.ratingService.getUserRatings(ids, userId);

    return items.map((item) => ({
      ...item,
      ratings: {
        general: item.rating,
        user: ratings.find((e) => $eq(e.itemId, item._id))?.stars,
      },
    }));
  }
}
