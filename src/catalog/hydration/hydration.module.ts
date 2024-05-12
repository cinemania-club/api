import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Rating, RatingSchema } from "src/rating/rating.schema";
import { CatalogItem, CatalogSchema } from "../item.schema";
import { CatalogHydration } from "./hydration.service";

@Module({
  providers: [CatalogHydration],
  imports: [
    MongooseModule.forFeature([
      { name: CatalogItem.name, schema: CatalogSchema },
      { name: Rating.name, schema: RatingSchema },
    ]),
  ],
  exports: [CatalogHydration],
})
export class HydrationModule {}
