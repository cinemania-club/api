import { Body, Controller, Delete, Param, Post, Req } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { Model } from "mongoose";
import { Anonymous } from "src/auth/auth.guard";
import { AddMoviesDto } from "./add-movies.dto";
import { CreatePlaylistDto } from "./create-playlist.dto";
import { DeletePlaylistDto } from "./delete-playlist.dto";
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
  @Post("add-movie")
  async addMovies(@Req() req: Request, @Body() dto: AddMoviesDto) {
    await this.playlistModel.updateMany(
      { userId: req.payload!.userId, _id: { $in: dto.playlists } },
      { $push: { movies: dto.movieId } },
    );
  }

  @Anonymous()
  @Delete("/:id")
  async deletePlaylist(@Req() req: Request, @Param() dto: DeletePlaylistDto) {
    await this.playlistModel.findOneAndDelete({
      _id: dto.id,
      userId: req.payload!.userId,
    });
  }
}
