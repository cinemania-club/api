import { Body, Controller, Post, Req } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import * as bcrypt from "bcrypt";
import { Request } from "express";
import { Model } from "mongoose";
import { Anonymous, Public } from "src/auth/auth.guard";
import { Oid } from "src/mongo";
import { UserService } from "src/user/user.service";
import { CreateAuthDto, SignInDto, SignUpDto } from "./auth.dto";
import { Auth } from "./auth.schema";
import { PASSWORD_SALT_ROUNDS } from "./constants";

@Controller("/auth")
export class AuthController {
  constructor(
    @InjectModel(Auth.name) private authModel: Model<Auth>,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  @Public()
  @Post()
  async create(@Body() dto: CreateAuthDto) {
    await this.authModel.updateOne({ uuid: dto.uuid }, {}, { upsert: true });
  }

  @Anonymous()
  @Post("/sign-up")
  async signUp(@Req() req: Request, @Body() dto: SignUpDto) {
    const auth = (await this.authModel.findById(req.payload!.userId))!;
    if (auth.user) throw new Error("Usuário já cadastrado");

    await this.userService.signUp({ ...dto, _id: auth._id });

    const hashedPassword = await bcrypt.hash(
      dto.password,
      PASSWORD_SALT_ROUNDS,
    );

    await this.authModel.findByIdAndUpdate(req.payload!.userId, {
      user: { email: dto.email, password: hashedPassword },
    });

    return await this.generateJwtToken(req.payload!.userId, auth.admin);
  }

  @Public()
  @Post("/sign-in")
  async signIn(@Body() dto: SignInDto) {
    const auth = await this.authModel.findOne({ "user.email": dto.email });
    const hash = auth?.user?.password || "";
    const valid = await bcrypt.compare(dto.password, hash);

    if (!auth || !valid) throw new Error("Invalid email or password");

    return await this.generateJwtToken(auth._id, auth.admin);
  }

  // PRIVATE METHODS

  private async generateJwtToken(userId: Oid, admin = false) {
    const payload = { sub: userId.toString(), admin };
    return { token: await this.jwtService.signAsync(payload) };
  }
}
