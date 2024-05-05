import { Body, Controller, Delete, Param, Post, Req } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { Model } from "mongoose";
import { Anonymous } from "src/auth/auth.guard";
import { AddItemDto, CreatePlaylistDto, PlaylistDto } from "./playlist.dto";
import { Playlist } from "./playlist.schema";

@Controller("/playlists")
export class PlaylistController {
  constructor(
    @InjectModel(Playlist.name) private playlistModel: Model<Playlist>,
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
  async addMovies(@Req() req: Request, @Body() dto: AddItemDto) {
    await this.playlistModel.updateMany(
      { userId: req.payload!.userId, _id: { $in: dto.playlists } },
      { $addToSet: { items: dto.itemId } },
    );

    await this.playlistModel.updateMany(
      { userId: req.payload!.userId, _id: { $nin: dto.playlists } },
      { $pull: { items: dto.itemId } },
    );
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
