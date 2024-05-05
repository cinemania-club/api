import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RatingModule } from "src/rating/rating.module";
import { SearchModule } from "src/search/search.module";
import { Rating, RatingSchema } from "../rating/rating.schema";
import { CatalogAdminController } from "./admin.controller";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";
import { CatalogItem, CatalogSchema } from "./item.schema";
import { LoaderService } from "./loader.service";
import { CatalogWorker } from "./worker/catalog.worker";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CatalogItem.name, schema: CatalogSchema },
    ]),
    MongooseModule.forFeature([{ name: Rating.name, schema: RatingSchema }]),
    SearchModule,
    CatalogWorker,
    RatingModule,
  ],
  exports: [LoaderService],
  controllers: [CatalogController, CatalogAdminController],
  providers: [LoaderService, CatalogService],
})
export class CatalogModule {}
