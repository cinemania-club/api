import { BullAdapter } from "@bull-board/api/bullAdapter";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { CatalogModule } from "src/catalog/catalog.module";
import { ScrapperController } from "./scrapper.controller";
import { ScrapperScheduler } from "./scrapper.scheduler";
import { ScrapperService } from "./scrapper.service";
import { TmdbAdapter } from "./tmdb.adapter";
import { TmdbEnqueuer } from "./tmdb.enqueuer";
import { TmdbProcessor } from "./tmdb.processor";

@Module({
  controllers: [ScrapperController],
  providers: [
    ScrapperService,
    TmdbProcessor,
    TmdbAdapter,
    ScrapperScheduler,
    TmdbEnqueuer,
  ],
  imports: [
    BullModule.registerQueue({
      name: "tmdb",
      limiter: { max: 1, duration: 100 },
    }),
    BullBoardModule.forFeature({
      name: "tmdb",
      adapter: BullAdapter,
    }),
    CatalogModule,
  ],
})
export class ScrapperModule {}
