import { InjectModel } from "@nestjs/mongoose";
import { pick } from "lodash";
import { Model } from "mongoose";
import { PLAYLIST_FIELDS } from "./constants";
import { Playlist } from "./playlist.schema";

export class PlaylistService {
  constructor(
    @InjectModel(Playlist.name) private playlistModel: Model<Playlist>,
  ) {}

  async getUserPlaylists(id: string) {
    const playlists = await this.playlistModel.find({ userId: id });
    return playlists.map((e) => pick(e, PLAYLIST_FIELDS));
  }
}
