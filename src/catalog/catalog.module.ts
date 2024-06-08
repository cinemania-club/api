import { Module } from "@nestjs/common";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { MongooseModule } from "@nestjs/mongoose";
import { ELASTICSEARCH_URL } from "src/constants";
import { Rating, RatingSchema } from "src/rating/rating.schema";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";
import { CatalogHydrationModule } from "./hydration/hydration.module";
import { CatalogItem, CatalogSchema } from "./item.schema";
import { LoaderService } from "./loader.service";
import { SearchService } from "./search.service";

@Module({
  controllers: [CatalogController],
  providers: [LoaderService, CatalogService, SearchService],
  imports: [
    MongooseModule.forFeature([
      { name: CatalogItem.name, schema: CatalogSchema },
      { name: Rating.name, schema: RatingSchema },
    ]),
    ElasticsearchModule.register({ node: ELASTICSEARCH_URL }),
    CatalogHydrationModule,
  ],
  exports: [LoaderService],
})
export class CatalogModule {}
