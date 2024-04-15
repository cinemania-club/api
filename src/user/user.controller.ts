import { Body, Controller, Post } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Public } from "src/auth/auth.guard";
import { Auth } from "src/auth/auth.schema";
import { CreateUserDto } from "./dto/create-user.dto";

@Controller("/users")
export class UserController {
  constructor(@InjectModel(Auth.name) private authModel: Model<Auth>) {}

  @Public()
  @Post()
  async create(@Body() user: CreateUserDto) {
    await this.authModel.updateOne({ uuid: user.uuid }, {}, { upsert: true });
  }
}
