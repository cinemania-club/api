import { BullAdapter } from "@bull-board/api/bullAdapter";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CatalogItem, CatalogSchema } from "src/catalog/item.schema";
import { QueueType } from "src/queue";
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
      name: QueueType.MOVIELENS,
      limiter: { max: 10, duration: 10 },
    }),
    BullBoardModule.forFeature({
      name: QueueType.MOVIELENS,
      adapter: BullAdapter,
    }),
  ],
})
export class MovielensModule {}
