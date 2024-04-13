import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { Model } from "mongoose";
import { Auth } from "./auth.schema";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@InjectModel(Auth.name) private authModel: Model<Auth>) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization;

    const user = await this.authModel.findOne({ uuid: token });
    if (!user) return false;

    request.payload = { userId: user._id };
    return true;
  }
}
