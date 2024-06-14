import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Oid } from "src/mongo";
import { DataSource } from "src/types";
import { Critic } from "./critic.schema";

@Injectable()
export class CriticService {
  constructor(@InjectModel(Critic.name) private criticModel: Model<Critic>) {}

  async createInternal(id: Oid) {
    await this.criticModel.updateOne(
      { source: DataSource.INTERNAL, userId: id },
      {},
      { upsert: true },
    );
  }
}
