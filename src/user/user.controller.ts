import { Body, Controller, Post } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Auth } from "src/auth/auth.schema";
import { UserCreateDto } from "./dto/createUser.dto";

@Controller("/users")
export class UserController {
  constructor(@InjectModel(Auth.name) private authModel: Model<Auth>) {}

  @Post()
  async create(@Body() user: UserCreateDto) {
    this.authModel.create({ uuid: user.uuid });
  }
}
