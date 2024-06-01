import { InjectModel } from "@nestjs/mongoose";
import { pick, uniqWith } from "lodash";
import { Model } from "mongoose";
import { CATALOG_FIELDS } from "src/catalog/constants";
import { CatalogHydration } from "src/catalog/hydration/hydration.service";
import { $eq, Oid } from "src/mongo";
import { PLAYLIST_FIELDS } from "./constants";
import { PlaylistItem } from "./playlist-item.schema";
import { Playlist } from "./playlist.schema";

export class PlaylistService {
  constructor(
    @InjectModel(Playlist.name) private playlistModel: Model<Playlist>,
    @InjectModel(PlaylistItem.name)
    private playlistItemModel: Model<PlaylistItem>,
    private catalogHydration: CatalogHydration,
  ) {}

  async getUserPlaylists(userId: Oid) {
    const playlists = await this.playlistModel.find({ userId });
    const playlistsItems = await this.playlistItemModel.find({
      userId,
      playlistId: playlists.map((p) => p._id),
    });

    const oids = playlistsItems.map((e) => e.itemId);
    const oidsUniq = uniqWith(oids, (a, b) => $eq(a, b));
    const items = await this.catalogHydration.hydrateItems(oidsUniq, userId);

    return playlists.map((p) => ({
      ...pick(p, PLAYLIST_FIELDS),
      items: playlistsItems
        .filter((pi) => $eq(pi.playlistId, p._id))
        .map((pi) => {
          const item = items.find((item) => $eq(pi.itemId, item._id));
          return pick(item, CATALOG_FIELDS);
        }),
    }));
  }
}
