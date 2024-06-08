import { Module } from "@nestjs/common";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { MongooseModule } from "@nestjs/mongoose";
import { ELASTICSEARCH_URL } from "src/constants";
import { RatingModule } from "src/rating/rating.module";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";
import { CatalogHydrationModule } from "./hydration/hydration.module";
import { CatalogItem, CatalogSchema } from "./item.schema";
import { LoaderService } from "./loader.service";
import { CatalogRatingService } from "./rating.service";
import { SearchService } from "./search.service";

@Module({
  controllers: [CatalogController],
  providers: [
    CatalogRatingService,
    LoaderService,
    CatalogService,
    SearchService,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: CatalogItem.name, schema: CatalogSchema },
    ]),
    ElasticsearchModule.register({ node: ELASTICSEARCH_URL }),
    RatingModule,
    CatalogHydrationModule,
  ],
  exports: [LoaderService],
})
export class CatalogModule {}
