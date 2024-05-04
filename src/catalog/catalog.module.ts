import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CatalogItem, CatalogSchema } from "./item.schema";
import { LoaderService } from "./loader.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CatalogItem.name, schema: CatalogSchema },
    ]),
  ],
  exports: [LoaderService],
  controllers: [],
  providers: [LoaderService],
})
export class CatalogModule {}
