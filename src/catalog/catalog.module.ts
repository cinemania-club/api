import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SearchModule } from "src/search/search.module";
import { CatalogItem, CatalogSchema } from "./item.schema";
import { LoaderService } from "./loader.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CatalogItem.name, schema: CatalogSchema },
    ]),
    SearchModule,
  ],
  exports: [LoaderService],
  controllers: [],
  providers: [LoaderService],
})
export class CatalogModule {}
