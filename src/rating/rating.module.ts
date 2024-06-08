import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CatalogHydrationModule } from "src/catalog/hydration/hydration.module";
import { CatalogItem, CatalogSchema } from "src/catalog/item.schema";
import { ProcessorType } from "src/processor";
import { MovielensModule } from "./movielens/movielens.module";
import { RatingExternal } from "./rating.external";
import { Rating, RatingSchema } from "./rating.schema";
import { RatingService } from "./rating.service";

@Module({
  providers: [RatingService, RatingExternal],
  imports: [
    MongooseModule.forFeature([
      { name: Rating.name, schema: RatingSchema },
      { name: CatalogItem.name, schema: CatalogSchema },
    ]),
    BullModule.registerQueue({
      name: ProcessorType.RATING,
      limiter: { max: 1, duration: 1000 },
    }),
    CatalogHydrationModule,
    MovielensModule,
  ],
  exports: [RatingExternal],
})
export class RatingModule {}
