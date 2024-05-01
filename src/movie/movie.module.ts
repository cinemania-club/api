import { Module } from "@nestjs/common";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "src/auth/auth.module";
import { ELASTICSEARCH_URL } from "src/constants";
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
    ElasticsearchModule.register({ node: ELASTICSEARCH_URL }),
    AuthModule,
  ],
  exports: [MovieService],
  controllers: [MovieController],
  providers: [MovieService],
})
export class MovieModule {}
