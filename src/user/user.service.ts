import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { InjectModel } from "@nestjs/mongoose";
import { pick } from "lodash";
import { Model } from "mongoose";
import { LIST_PAGE_SIZE } from "src/constants";
import { SearchDto } from "./user.dto";
import { User } from "./user.schema";

type UnpersistedUser = Pick<User, "_id" | "username" | "email" | "name">;

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async signUp(user: UnpersistedUser) {
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

  async search(dto: SearchDto) {
    const result = await this.elasticsearchService.search({
      index: "user",
      _source: [],
      size: LIST_PAGE_SIZE,
      query: {
        bool: {
          must: { multi_match: { query: dto.query } },
          must_not: { ids: { values: dto.skip } },
        },
      },
    });

    const ids = result.hits.hits.map((hit) => hit._id);
    return this.userModel.find({ _id: { $in: ids } });
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
