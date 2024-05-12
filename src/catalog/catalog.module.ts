import { BullAdapter } from "@bull-board/api/bullAdapter";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { MongooseModule } from "@nestjs/mongoose";
import { ELASTICSEARCH_URL } from "src/constants";
import { RatingModule } from "src/rating/rating.module";
import { CatalogAdminController } from "./admin.controller";
import { CatalogController } from "./catalog.controller";
import { CatalogScheduler } from "./catalog.scheduler";
import { CatalogService } from "./catalog.service";
import { HydrationModule } from "./hydration/hydration.module";
import { CatalogItem, CatalogSchema } from "./item.schema";
import { LoaderService } from "./loader.service";
import { CatalogRatingProcessor } from "./rating.processor";
import { CatalogRatingService } from "./rating.service";
import { SearchService } from "./search.service";

@Module({
  controllers: [CatalogController, CatalogAdminController],
  providers: [
    CatalogScheduler,
    CatalogRatingService,
    CatalogRatingProcessor,
    LoaderService,
    CatalogService,
    SearchService,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: CatalogItem.name, schema: CatalogSchema },
    ]),
    ElasticsearchModule.register({ node: ELASTICSEARCH_URL }),
    BullModule.registerQueue({
      name: "catalogRating",
      limiter: { max: 1, duration: 1000 },
    }),
    BullBoardModule.forFeature({
      name: "catalogRating",
      adapter: BullAdapter,
    }),
    RatingModule,
    HydrationModule,
  ],
  exports: [LoaderService],
})
export class CatalogModule {}
