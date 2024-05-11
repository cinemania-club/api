import { Body, Controller, Post, Req } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as bcrypt from "bcrypt";
import { Request } from "express";
import { Model } from "mongoose";
import { Anonymous, Public } from "src/auth/auth.guard";
import { CreateAuthDto, SignUpDto } from "./auth.dto";
import { Auth } from "./auth.schema";
import { PASSWORD_SALT_ROUNDS } from "./constants";

@Controller("/auth")
export class AuthController {
  constructor(@InjectModel(Auth.name) private authModel: Model<Auth>) {}

  @Public()
  @Post()
  async create(@Body() dto: CreateAuthDto) {
    await this.authModel.updateOne({ uuid: dto.uuid }, {}, { upsert: true });
  }

  @Anonymous()
  @Post("/sign-up")
  async signUp(@Req() req: Request, @Body() dto: SignUpDto) {
    const usernameInUse = await this.authModel.exists({
      "user.username": dto.username,
    });
    if (usernameInUse) throw new Error("Username already in use");

    const auth = (await this.authModel.findById(req.payload!.userId))!;
    if (auth.user)
      throw new Error("Sign up is only available for anonymous users");

    const hashedPassword = await bcrypt.hash(
      dto.password,
      PASSWORD_SALT_ROUNDS,
    );

    await this.authModel.findByIdAndUpdate(req.payload!.userId, {
      user: { ...dto, password: hashedPassword },
    });
  }
}
