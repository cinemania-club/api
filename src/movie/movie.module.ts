import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "src/auth/auth.module";
import { MovieVote, MovieVoteSchema } from "./movie-vote.schema";
import { MovieController } from "./movie.controller";
import { Movie, MovieSchema } from "./movie.schema";
import { MovieService } from "./movie.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
    MongooseModule.forFeature([
      { name: MovieVote.name, schema: MovieVoteSchema },
    ]),
    AuthModule,
  ],
  exports: [
    MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
  ],
  controllers: [MovieController],
  providers: [MovieService],
})
export class MovieModule {}
