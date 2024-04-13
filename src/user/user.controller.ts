import { Body, Controller, Post } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserCreateDto } from "./dto/createUser.dto";
import { User } from "./user.schema";

@Controller("/users")
export class UserController {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  @Post()
  async create(@Body() user: UserCreateDto) {
    this.userModel.create(user);
  }
}
