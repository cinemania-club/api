import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { IndexerModule } from "src/indexer/indexer.module";
import { CatalogItem, CatalogSchema } from "./item.schema";
import { LoaderService } from "./loader.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CatalogItem.name, schema: CatalogSchema },
    ]),
    IndexerModule,
  ],
  exports: [LoaderService],
  controllers: [],
  providers: [LoaderService],
})
export class CatalogModule {}
