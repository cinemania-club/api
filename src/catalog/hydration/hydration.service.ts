import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { $eq, Oid } from "src/mongo";
import { Playlist } from "src/playlist/playlist.schema";
import { Rating } from "src/rating/rating.schema";
import { CatalogItem } from "../item.schema";

@Injectable()
export class CatalogHydration {
  constructor(
    @InjectModel(CatalogItem.name) private catalogModel: Model<CatalogItem>,
    @InjectModel(Rating.name) private ratingModel: Model<Rating>,
    @InjectModel(Playlist.name) private playlistModel: Model<Playlist>,
  ) {}

  async hydrateItems(itemIds: Oid[], userId: Oid) {
    const items = await this.catalogModel
      .find({ _id: { $in: itemIds } })
      .lean();

    let result = itemIds
      .map((id) => items.find((e) => $eq(e._id, id)))
      .filter((e) => e) as CatalogItem[];

    result = await this.addRatings(result, userId);
    result = await this.addPlaylists(result);

    return result;
  }

  // PRIVATE METHODS

  private async addRatings(items: CatalogItem[], userId: Oid) {
    const ids = items.map((item) => item._id);
    const ratings = await this.ratingModel.find({
      userId,
      itemId: { $in: ids },
    });

    return items.map((item) => ({
      ...item,
      ratings: {
        general: item.rating,
        user: ratings.find((e) => $eq(e.itemId, item._id))?.stars,
      },
    }));
  }

  private async addPlaylists(items: CatalogItem[]) {
    /** @todo: terminar */
    // const playlists = await this.playlistModel.find({ userId });
    return items;
  }
}
