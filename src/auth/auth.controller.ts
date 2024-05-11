import { Body, Controller, Post } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Public } from "src/auth/auth.guard";
import { CreateAuthDto } from "./auth.dto";
import { Auth } from "./auth.schema";

@Controller("/auth")
export class AuthController {
  constructor(@InjectModel(Auth.name) private authModel: Model<Auth>) {}

  @Public()
  @Post()
  async create(@Body() dto: CreateAuthDto) {
    await this.authModel.updateOne({ uuid: dto.uuid }, {}, { upsert: true });
  }
}
