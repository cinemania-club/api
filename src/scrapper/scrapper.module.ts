import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { CatalogModule } from "src/catalog/catalog.module";
import { ScrapperScheduler } from "./scrapper.scheduler";
import { ScrapperService } from "./scrapper.service";
import { TmdbAdapter } from "./tmdb.adapter";
import { TmdbProcessor } from "./tmdb.processor";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "tmdb",
      limiter: { max: 1, duration: 100 },
    }),
    CatalogModule,
  ],
  exports: [],
  providers: [ScrapperService, TmdbProcessor, TmdbAdapter, ScrapperScheduler],
})
export class ScrapperModule {}
