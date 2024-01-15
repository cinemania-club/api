import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";

@Injectable()
export class MovieRepository {
  constructor(@InjectConnection() private connection: Connection) {}

  async upsert(movie: { id: number }) {
    await this.connection.db
      .collection<{ _id: number }>("movies")
      .updateOne({ _id: movie.id }, { $set: movie }, { upsert: true });
  }

  // async changes() {
  //   await this.connection.db
  //     .collection<{ _id: number }>("changes")
  //     .updateOne({ _id: movie.id }, { $set: movie }, { upsert: true });
  // }
}
