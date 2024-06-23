import { Controller, Get, Param, Post, Req } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { pick } from "lodash";
import { Model } from "mongoose";
import { Anonymous } from "src/auth.guard";
import { USER_FIELDS } from "../constants";
import { User } from "../user.schema";
import { FollowDto } from "./connection.dto";
import { Connection } from "./connection.schema";

@Controller("/user")
export class ConnectionController {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Connection.name) private connectionModel: Model<Connection>,
  ) {}

  @Anonymous()
  @Get("/connections")
  async getConnections(@Req() req: Request) {
    const connections = await this.connectionModel.find({
      follower: req.payload!.userId,
    });

    const ids = connections.map((e) => e.followee);
    const users = await this.userModel.find({ _id: { $in: ids } });

    return users.map((e) => pick(e, USER_FIELDS));
  }

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
