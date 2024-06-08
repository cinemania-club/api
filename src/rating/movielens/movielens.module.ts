import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CatalogItem, CatalogSchema } from "src/catalog/item.schema";
import { ProcessorType } from "src/processor";
import { Rating, RatingSchema } from "../rating.schema";
import { MovielensLink, MovielensLinkSchema } from "./link.schema";
import { MovielensProcessor } from "./movielens.processor";
import { MovielensRating, MovielensRatingSchema } from "./rating.schema";

@Module({
  providers: [MovielensProcessor],
  imports: [
    MongooseModule.forFeature([
      { name: Rating.name, schema: RatingSchema },
      { name: MovielensLink.name, schema: MovielensLinkSchema },
      { name: MovielensRating.name, schema: MovielensRatingSchema },
      { name: CatalogItem.name, schema: CatalogSchema },
    ]),
    BullModule.registerQueue({
      name: ProcessorType.MOVIELENS,
      limiter: { max: 10, duration: 10 },
    }),
  ],
})
export class MovielensModule {}
