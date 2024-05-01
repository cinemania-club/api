import { Module } from "@nestjs/common";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { ELASTICSEARCH_URL } from "src/constants";
import { MovieModule } from "src/movie/movie.module";
import { IndexerScheduler } from "./indexer.scheduler";
import { IndexerService } from "./indexer.service";

@Module({
  imports: [
    ElasticsearchModule.register({ node: ELASTICSEARCH_URL }),
    MovieModule,
  ],
  providers: [IndexerScheduler, IndexerService],
})
export class IndexerModule {}
