import { Module } from "@nestjs/common";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { ELASTICSEARCH_URL } from "src/constants";
import { IndexerService } from "./indexer.service";

@Module({
  imports: [ElasticsearchModule.register({ node: ELASTICSEARCH_URL })],
  exports: [IndexerService],
  providers: [IndexerService],
})
export class IndexerModule {}
