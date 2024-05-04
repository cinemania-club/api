import { Module } from "@nestjs/common";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { ELASTICSEARCH_URL } from "src/constants";
import { SearchService } from "./search.service";

@Module({
  imports: [ElasticsearchModule.register({ node: ELASTICSEARCH_URL })],
  exports: [SearchService],
  providers: [SearchService],
})
export class SearchModule {}
