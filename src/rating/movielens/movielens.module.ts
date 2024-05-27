import { BullAdapter } from "@bull-board/api/bullAdapter";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
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
    ]),
    BullModule.registerQueue({
      name: "movielens",
      limiter: { max: 1, duration: 5000 },
    }),
    BullBoardModule.forFeature({
      name: "movielens",
      adapter: BullAdapter,
    }),
  ],
})
export class MovielensModule {}
