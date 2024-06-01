import { Body, Controller, Delete, Param, Post, Req } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { Model } from "mongoose";
import { Anonymous } from "src/auth/auth.guard";
import { PlaylistItem } from "./playlist-item.schema";
import { AddItemDto, CreatePlaylistDto, PlaylistDto } from "./playlist.dto";
import { Playlist } from "./playlist.schema";

@Controller("/playlists")
export class PlaylistController {
  constructor(
    @InjectModel(Playlist.name) private playlistModel: Model<Playlist>,
    @InjectModel(PlaylistItem.name)
    private playlistItemModel: Model<PlaylistItem>,
  ) {}

  @Anonymous()
  @Post()
  async createPlaylist(@Req() req: Request, @Body() dto: CreatePlaylistDto) {
    const created = await this.playlistModel.create({
      userId: req.payload!.userId,
      name: dto.name,
    });

    return { id: created._id };
  }

  @Anonymous()
  @Post("/add")
  async addItems(@Req() req: Request, @Body() dto: AddItemDto) {
    await this.playlistItemModel.deleteMany({
      userId: req.payload!.userId,
      itemId: dto.itemId,
    });

    const playlistItems = dto.playlists.map((playlistId) => ({
      userId: req.payload!.userId,
      playlistId,
      itemId: dto.itemId,
    }));
    await this.playlistItemModel.create(playlistItems);
  }

  @Anonymous()
  @Delete("/:id")
  async deletePlaylist(@Req() req: Request, @Param() params: PlaylistDto) {
    await this.playlistModel.findOneAndDelete({
      _id: params.id,
      userId: req.payload!.userId,
    });
  }
}
