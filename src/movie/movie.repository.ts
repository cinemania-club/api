import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Movie } from "./movie.schema";

type UnpersistedMovie = Omit<Movie, "loadedAt">;

@Injectable()
export class MovieRepository {
  constructor(@InjectModel(Movie.name) private movieModel: Model<Movie>) {}

  async saveMovie(movie: UnpersistedMovie) {
    await this.movieModel.updateOne(
      { _id: movie._id },
      { ...movie, loadedAt: new Date() },
      { upsert: true },
    );
  }
}
