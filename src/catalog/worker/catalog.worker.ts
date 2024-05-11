import { BullAdapter } from "@bull-board/api/bullAdapter";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RatingModule } from "src/rating/rating.module";
import { CatalogItem, CatalogSchema } from "../item.schema";
import { CatalogScheduler } from "./catalog.scheduler";
import { CatalogRatingProcessor } from "./rating.processor";
import { CatalogRatingService } from "./rating.service";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "catalogRating",
      limiter: { max: 1, duration: 1000 },
    }),
    BullBoardModule.forFeature({
      name: "catalogRating",
      adapter: BullAdapter,
    }),
    MongooseModule.forFeature([
      { name: CatalogItem.name, schema: CatalogSchema },
    ]),
    RatingModule,
  ],
  exports: [BullModule.registerQueue({ name: "catalogRating" })],
  providers: [CatalogScheduler, CatalogRatingService, CatalogRatingProcessor],
})
export class CatalogWorker {}
