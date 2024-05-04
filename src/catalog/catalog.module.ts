import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SearchModule } from "src/search/search.module";
import { CatalogController } from "./catalog.controller";
import { CatalogItem, CatalogSchema } from "./item.schema";
import { LoaderService } from "./loader.service";
import { Rating, RatingSchema } from "./rating.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CatalogItem.name, schema: CatalogSchema },
    ]),
    MongooseModule.forFeature([{ name: Rating.name, schema: RatingSchema }]),
    SearchModule,
  ],
  exports: [LoaderService],
  controllers: [CatalogController],
  providers: [LoaderService],
})
export class CatalogModule {}
