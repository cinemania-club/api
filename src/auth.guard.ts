import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { Model } from "mongoose";
import { $oid } from "src/mongo";
import { JwtPayload, RequestPayload } from "src/types";
import { User } from "src/user/user.schema";

enum AccessLevel {
  PUBLIC = 1,
  ANONYMOUS = 2,
  AUTHENTICATED = 3,
  ADMIN = 4,
}

type UserProfile = {
  level: AccessLevel;
  payload?: RequestPayload;
};

export const Admin = () => SetMetadata(AccessLevel.ADMIN, true);
export const Authenticated = () => SetMetadata(AccessLevel.AUTHENTICATED, true);
export const Anonymous = () => SetMetadata(AccessLevel.ANONYMOUS, true);
export const Public = () => SetMetadata(AccessLevel.PUBLIC, true);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private authModel: Model<User>,
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const targetLevel = this.getTargetLevel(context);
    if (!targetLevel) return false;

    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization;
    const profile = await this.getUserProfile(authorization);

    request.payload = profile.payload;
    return profile.level >= targetLevel;
  }

  // PRIVATE METHODS

  private getTargetLevel(context: ExecutionContext) {
    const levels = Object.values(AccessLevel) as AccessLevel[];

    for (const level of levels) {
      const testLevel = this.reflector.getAllAndOverride<boolean>(level, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (testLevel) return level;
    }
  }

  private async getUserProfile(authorization?: string): Promise<UserProfile> {
    if (!authorization) return { level: AccessLevel.PUBLIC };

    const isAuthenticated = await this.checkAuthenticated(authorization);
    if (isAuthenticated) return isAuthenticated;

    const isAnnonymous = await this.checkAnnonymous(authorization);
    if (isAnnonymous) return isAnnonymous;

    return { level: AccessLevel.PUBLIC };
  }

  private async checkAuthenticated(authorization: string) {
    const token = authorization.match(/^Bearer (?<token>.+)$/)?.groups?.token;
    if (!token) return;

    const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: process.env.JWT_SECRET,
    });

    const level = payload.admin ? AccessLevel.ADMIN : AccessLevel.AUTHENTICATED;
    return { level, payload: { userId: $oid(payload.sub) } };
  }

  private async checkAnnonymous(authorization: string) {
    const user = await this.authModel.findOne({ uuid: authorization });
    if (!user) return;

    return {
      level: user.admin ? AccessLevel.ADMIN : AccessLevel.ANONYMOUS,
      payload: { userId: user._id },
    };
  }
}
