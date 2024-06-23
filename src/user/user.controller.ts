import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { pick } from "lodash";
import { Model } from "mongoose";
import { Anonymous, Public } from "src/auth.guard";
import { $oid } from "src/mongo";
import { PlaylistExternal } from "src/playlist/playlist.service";
import { USER_FIELDS } from "./constants";
import {
  AnonymousUserDto,
  SearchDto,
  SetStreamingsDto,
  SignInDto,
  SignUpDto,
  UserDto,
} from "./user.dto";
import { User } from "./user.schema";
import { UserService } from "./user.service";

@Controller("/user")
export class UserController {
  constructor(
    private userService: UserService,
    private playlistExternal: PlaylistExternal,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  @Public()
  @Post()
  async create(@Body() dto: AnonymousUserDto) {
    await this.userModel.findOneAndUpdate(
      { uuid: dto.uuid },
      {},
      { upsert: true, new: true },
    );
  }

  @Anonymous()
  @Post("/sign-up")
  async signUp(@Req() req: Request, @Body() dto: SignUpDto) {
    const token = await this.userService.signUp(req.payload!.userId, dto);
    return { token };
  }

  @Public()
  @Post("/sign-in")
  async signIn(@Body() dto: SignInDto) {
    const token = await this.userService.signIn(dto);
    return { token };
  }

  @Anonymous()
  @Get("/search")
  async search(@Body() dto: SearchDto) {
    const users = await this.userService.search(dto);
    return users.map((e) => pick(e, USER_FIELDS));
  }

  @Anonymous()
  @Get("/:id")
  async getUserDetails(@Param() params: UserDto) {
    const oid = $oid(params.id);
    const user = (await this.userModel.findById(oid))!;

    return {
      ...pick(user, USER_FIELDS),
      playlists: await this.playlistExternal.getUserPlaylists(oid),
    };
  }

  @Anonymous()
  @Post("/streamings")
  async setStreamings(@Req() req: Request, @Body() dto: SetStreamingsDto) {
    await this.userModel.findByIdAndUpdate(req.payload!.userId, {
      streamings: dto.streamings,
    });
  }
}
