import { Module } from "@nestjs/common";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { MongooseModule } from "@nestjs/mongoose";
import { ELASTICSEARCH_URL } from "src/constants";
import { Movie, MovieSchema } from "src/movie/movie.schema";
import { MovieScheduler } from "./movie.scheduler";
import { MovieService } from "./movie.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
    ElasticsearchModule.register({ node: ELASTICSEARCH_URL }),
  ],
  providers: [MovieScheduler, MovieService],
})
export class MovieModule {}
