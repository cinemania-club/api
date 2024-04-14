import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { Model } from "mongoose";
import { Auth } from "./auth.schema";

enum AccessLevel {
  ADMIN = "ACCESS_LEVEL_ADMIN",
  AUTHENTICATED = "ACCESS_LEVEL_AUTHENTICATED",
  ANONYMOUS = "ACCESS_LEVEL_ANONYMOUS",
  PUBLIC = "ACCESS_LEVEL_PUBLIC",
}

export const Admin = () => SetMetadata(AccessLevel.ADMIN, true);
export const Authenticated = () => SetMetadata(AccessLevel.AUTHENTICATED, true);
export const Anonymous = () => SetMetadata(AccessLevel.ANONYMOUS, true);
export const Public = () => SetMetadata(AccessLevel.PUBLIC, true);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectModel(Auth.name) private authModel: Model<Auth>,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const accessLevel = this.getAccessLevel(context);
    if (accessLevel === AccessLevel.PUBLIC) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization;
    if (!authorization) return false;

    const user = await this.authModel.findOne({
      $or: [{ uuid: authorization }, { token: authorization }],
    });

    if (!user) return false;
    request.payload = { userId: user._id };

    if (accessLevel === AccessLevel.ANONYMOUS) return true;

    const isAuthenticated = user.token === authorization;
    if (accessLevel === AccessLevel.AUTHENTICATED) return isAuthenticated;

    const isAdmin = user.admin;
    if (accessLevel === AccessLevel.ADMIN) return isAdmin;

    return false;
  }

  getAccessLevel(context: ExecutionContext) {
    const levels = [
      AccessLevel.PUBLIC,
      AccessLevel.ANONYMOUS,
      AccessLevel.AUTHENTICATED,
      AccessLevel.ADMIN,
    ];

    for (const level of levels) {
      const testLevel = this.reflector.getAllAndOverride<boolean>(level, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (testLevel) return level;
    }
  }
}
