import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CatalogHydrationModule } from "src/catalog/hydration/hydration.module";
import { MovielensModule } from "./movielens/movielens.module";
import { RatingExternal } from "./rating.external";
import { Rating, RatingSchema } from "./rating.schema";
import { RatingService } from "./rating.service";

@Module({
  providers: [RatingService, RatingExternal],
  imports: [
    MongooseModule.forFeature([{ name: Rating.name, schema: RatingSchema }]),
    CatalogHydrationModule,
    MovielensModule,
  ],
  exports: [RatingService, RatingExternal],
})
export class RatingModule {}
