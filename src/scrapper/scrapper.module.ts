import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { CatalogModule } from "src/catalog/catalog.module";
import { ProcessorType } from "src/processor";
import { ScrapperService } from "./scrapper.service";
import { TmdbAdapter } from "./tmdb.adapter";
import { TmdbProcessor } from "./tmdb.processor";

@Module({
  providers: [ScrapperService, TmdbProcessor, TmdbAdapter],
  imports: [
    BullModule.registerQueue({
      name: ProcessorType.TMDB,
      limiter: { max: 1, duration: 100 },
    }),
    CatalogModule,
  ],
})
export class ScrapperModule {}
