import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { REDIS_URL } from "src/constants";
import { RatingModule } from "src/rating/rating.module";
import { CatalogItem, CatalogSchema } from "../item.schema";
import { CatalogScheduler } from "./catalog.scheduler";
import { CatalogRatingProcessor } from "./rating.processor";
import { CatalogRatingService } from "./rating.service";

@Module({
  imports: [
    BullModule.forRoot({ redis: REDIS_URL }),
    BullModule.registerQueue({
      name: "catalogRating",
      limiter: { max: 1, duration: 1000 },
    }),
    MongooseModule.forFeature([
      { name: CatalogItem.name, schema: CatalogSchema },
    ]),
    RatingModule,
  ],
  exports: [
    BullModule.forRoot({ redis: REDIS_URL }),
    BullModule.registerQueue({ name: "catalogRating" }),
  ],
  providers: [CatalogScheduler, CatalogRatingService, CatalogRatingProcessor],
})
export class CatalogWorker {}
