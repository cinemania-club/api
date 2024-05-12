import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { InjectModel } from "@nestjs/mongoose";
import { pick } from "lodash";
import { Model } from "mongoose";
import { User } from "./user.schema";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

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

    await this.elasticsearchService.index({
      index: "user",
      id: user._id.toString(),
      document: pick(user, "username", "name"),
    });
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
