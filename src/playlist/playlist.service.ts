import { InjectModel } from "@nestjs/mongoose";
import { pick, uniqWith } from "lodash";
import { Model } from "mongoose";
import { CATALOG_FIELDS } from "src/catalog/constants";
import { CatalogHydration } from "src/catalog/hydration/hydration.service";
import { $eq, Oid } from "src/mongo";
import { PLAYLIST_FIELDS } from "./constants";
import { Playlist } from "./playlist.schema";

export class PlaylistService {
  constructor(
    @InjectModel(Playlist.name) private playlistModel: Model<Playlist>,
    private catalogHydration: CatalogHydration,
  ) {}

  async getUserPlaylists(id: Oid) {
    const playlists = await this.playlistModel.find({ userId: id });

    const oids = playlists.flatMap((e) => e.items);
    const oidsUniq = uniqWith(oids, (a, b) => $eq(a, b));
    const items = await this.catalogHydration.hydrateItems(oidsUniq, id);

    return playlists.map((e) => ({
      ...pick(e, PLAYLIST_FIELDS),
      items: items.map((playlistItem) => {
        const item = items.find((item) => $eq(playlistItem._id, item._id));
        return pick(item, CATALOG_FIELDS);
      }),
    }));
  }
}
