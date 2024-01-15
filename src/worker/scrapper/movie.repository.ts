import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { ChangesMovie } from "./tmdb.adapter";

@Injectable()
export class MovieRepository {
  constructor(@InjectConnection() private connection: Connection) {}

  async saveChanges(movies: ChangesMovie[]) {
    const moviesWithId = movies.map((movie) => ({
      _id: movie.id,
      ...movies,
    }));

    await this.connection.db
      .collection<{ _id: number }>("changes")
      .insertMany(moviesWithId);
  }

  async saveMovie(movie: { id: number }) {
    await this.connection.db
      .collection<{ _id: number }>("movies")
      .updateOne({ _id: movie.id }, { $set: movie }, { upsert: true });
  }
}
