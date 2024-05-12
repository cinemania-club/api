import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "./user.schema";

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async signUp(user: User) {
    await this.checkUniqueField(
      "_id",
      user._id.toString(),
      "Usuário já cadastrado",
    );

    await this.checkUniqueField("email", user.email, "Email já cadastrado");

    await this.checkUniqueField(
      "username",
      user.username,
      "Nome de usuário indisponível",
    );

    await this.userModel.create(user);
  }

  private async checkUniqueField(
    field: string,
    value: string,
    message: string,
  ) {
    const duplicate = await this.userModel.exists({ [field]: value });
    if (duplicate) throw new Error(message);
  }
}
