import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import * as bcrypt from "bcrypt";
import { pick } from "lodash";
import { Model } from "mongoose";
import { LIST_PAGE_SIZE, PASSWORD_SALT_ROUNDS } from "src/constants";
import { Oid } from "src/mongo";
import { PlaylistExternal } from "src/playlist/playlist.service";
import { SearchDto, SignInDto, SignUpDto } from "./user.dto";
import { User } from "./user.schema";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private playlistExternal: PlaylistExternal,
    private readonly elasticsearchService: ElasticsearchService,
    private jwtService: JwtService,
  ) {}

  async signUp(userId: Oid, profile: SignUpDto) {
    const user = (await this.userModel.findById(userId))!;
    if (user.profile)
      throw new HttpException("Usuário já cadastrado", HttpStatus.BAD_REQUEST);

    await this.checkUniqueField(
      "profile.username",
      profile.username,
      "Nome de usuário indisponível",
    );

    await this.checkUniqueField(
      "profile.email",
      profile.email,
      "Email já cadastrado",
    );

    await this.saveProfile(userId, profile);
    await this.playlistExternal.createUser(user._id);

    await this.elasticsearchService.index({
      index: "user",
      id: user._id.toString(),
      document: pick(user, "username", "name"),
    });

    return await this.jwtService.signAsync(user.token);
  }

  async signIn(dto: SignInDto) {
    const user = await this.authenticate(dto);
    return await this.jwtService.signAsync(user.token);
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

  private async saveProfile(userId: Oid, profile: SignUpDto) {
    const password = await bcrypt.hash(profile.password, PASSWORD_SALT_ROUNDS);
    await this.userModel.findByIdAndUpdate(userId, {
      profile: { ...profile, password },
    });
  }

  private async checkUniqueField(
    field: string,
    value: string,
    message: string,
  ) {
    const duplicate = await this.userModel.exists({ [field]: value });
    if (duplicate) throw new HttpException(message, HttpStatus.BAD_REQUEST);
  }

  private async authenticate(dto: SignInDto) {
    const user = await this.userModel.findOne({ "profile.email": dto.email });

    const hash = user?.profile?.password || "";
    const valid = await bcrypt.compare(dto.password, hash);

    if (!user || !valid)
      throw new HttpException("Credenciais inválidas", HttpStatus.UNAUTHORIZED);

    return user;
  }
}
