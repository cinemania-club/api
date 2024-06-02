import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CatalogHydrationModule } from "src/catalog/hydration/hydration.module";
import { MovielensModule } from "./movielens/movielens.module";
import { Rating, RatingSchema } from "./rating.schema";
import { RatingService } from "./rating.service";

@Module({
  providers: [RatingService],
  imports: [
    MongooseModule.forFeature([{ name: Rating.name, schema: RatingSchema }]),
    CatalogHydrationModule,
    MovielensModule,
  ],
  exports: [RatingService],
})
export class RatingModule {}
