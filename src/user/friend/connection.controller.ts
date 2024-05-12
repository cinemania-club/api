import { Controller, Param, Post, Req } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { Model } from "mongoose";
import { Anonymous } from "src/auth/auth.guard";
import { FollowDto } from "./connection.dto";
import { Connection } from "./connection.schema";

@Controller("/user")
export class ConnectionController {
  constructor(
    @InjectModel(Connection.name) private connectionModel: Model<Connection>,
  ) {}

  @Anonymous()
  @Post("/:followee/follow")
  async followUser(@Req() req: Request, @Param() params: FollowDto) {
    await this.connectionModel.updateOne(
      { follower: req.payload!.userId, followee: params.followee },
      { following: true },
      { upsert: true },
    );
  }

  @Anonymous()
  @Post("/:followee/unfollow")
  async unfollowUser(@Req() req: Request, @Param() params: FollowDto) {
    await this.connectionModel.updateOne(
      { follower: req.payload!.userId, followee: params.followee },
      { following: false },
      { upsert: true },
    );
  }
}
