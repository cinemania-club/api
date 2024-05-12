import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { pick } from "lodash";
import { Model } from "mongoose";
import { Anonymous } from "src/auth/auth.guard";
import { PlaylistService } from "src/playlist/playlist.service";
import { USER_FIELDS } from "./constants";
import { SearchDto, SetStreamingsDto, UserDto } from "./user.dto";
import { User } from "./user.schema";
import { UserService } from "./user.service";

@Controller("/user")
export class UserController {
  constructor(
    private userService: UserService,
    private playlistService: PlaylistService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  @Anonymous()
  @Get("/search")
  async search(@Body() dto: SearchDto) {
    const users = await this.userService.search(dto);
    return users.map((e) => pick(e, USER_FIELDS));
  }

  @Anonymous()
  @Get("/:id")
  async getUserDetails(@Param() params: UserDto) {
    const user = (await this.userModel.findById(params.id))!;
    const playlists = await this.playlistService.getUserPlaylists(params.id);

    return { ...pick(user, USER_FIELDS), playlists };
  }

  @Anonymous()
  @Post("/streamings")
  async setStreamings(@Req() req: Request, @Body() dto: SetStreamingsDto) {
    await this.userModel.findByIdAndUpdate(req.payload!.userId, {
      streamings: dto.streamings,
    });
  }
}
