import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CatalogHydrationModule } from "src/catalog/hydration/hydration.module";
import { MovielensLink, MovielensLinkSchema } from "./movielens/link.schema";
import { RatingExternal } from "./rating.external";
import { Rating, RatingSchema } from "./rating.schema";
import { RatingService } from "./rating.service";

@Module({
  providers: [RatingService, RatingExternal],
  imports: [
    MongooseModule.forFeature([
      { name: Rating.name, schema: RatingSchema },
      { name: MovielensLink.name, schema: MovielensLinkSchema },
    ]),
    CatalogHydrationModule,
  ],
  exports: [RatingService, RatingExternal],
})
export class RatingModule {}
