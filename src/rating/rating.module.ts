import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { HydrationModule } from "src/catalog/hydration/hydration.module";
import { RatingExternal } from "./rating.external";
import { Rating, RatingSchema } from "./rating.schema";
import { RatingService } from "./rating.service";

@Module({
  providers: [RatingService, RatingExternal],
  imports: [
    MongooseModule.forFeature([{ name: Rating.name, schema: RatingSchema }]),
    HydrationModule,
  ],
  exports: [RatingService, RatingExternal],
})
export class RatingModule {}
