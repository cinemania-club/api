import { BullAdapter } from "@bull-board/api/bullAdapter";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RatingModule } from "src/rating/rating.module";
import { SearchModule } from "src/search/search.module";
import { CatalogAdminController } from "./admin.controller";
import { CatalogController } from "./catalog.controller";
import { CatalogScheduler } from "./catalog.scheduler";
import { CatalogService } from "./catalog.service";
import { CatalogItem, CatalogSchema } from "./item.schema";
import { LoaderService } from "./loader.service";
import { CatalogRatingProcessor } from "./rating.processor";
import { CatalogRatingService } from "./rating.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CatalogItem.name, schema: CatalogSchema },
    ]),
    BullModule.registerQueue({
      name: "catalogRating",
      limiter: { max: 1, duration: 1000 },
    }),
    BullBoardModule.forFeature({
      name: "catalogRating",
      adapter: BullAdapter,
    }),
    SearchModule,
    RatingModule,
  ],
  exports: [LoaderService],
  controllers: [CatalogController, CatalogAdminController],
  providers: [
    CatalogScheduler,
    CatalogRatingService,
    CatalogRatingProcessor,
    LoaderService,
    CatalogService,
  ],
})
export class CatalogModule {}
