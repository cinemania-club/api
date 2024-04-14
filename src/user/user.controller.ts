import { Body, Controller, Post } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Public } from "src/auth/auth.guard";
import { Auth } from "src/auth/auth.schema";
import { UserCreateDto } from "./dto/createUser.dto";

@Controller("/users")
export class UserController {
  constructor(@InjectModel(Auth.name) private authModel: Model<Auth>) {}

  @Public()
  @Post()
  async create(@Body() user: UserCreateDto) {
    this.authModel.updateOne({ uuid: user.uuid }, {}, { upsert: true });
  }
}
