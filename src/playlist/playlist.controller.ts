import { Body, Controller, Post, Req } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { Model } from "mongoose";
import { Anonymous } from "src/auth/auth.guard";
import { CreatePlaylistDto } from "./create-playlist.dto";
import { Playlist } from "./playlist.schema";

@Controller("/playlists")
export class PlaylistController {
  constructor(
    @InjectModel(Playlist.name) private playlistModel: Model<Playlist>,
  ) {}

  @Anonymous()
  @Post()
  async createPlaylist(
    @Req() req: Request,
    @Body() playlist: CreatePlaylistDto,
  ) {
    const created = await this.playlistModel.create({
      userId: req.payload!.userId,
      name: playlist.name,
    });

    return { id: created._id };
  }
}
