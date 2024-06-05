import { BullAdapter } from "@bull-board/api/bullAdapter";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { CatalogModule } from "src/catalog/catalog.module";
import { ProcessorType } from "src/processor";
import { ScrapperController } from "./scrapper.controller";
import { ScrapperService } from "./scrapper.service";
import { TmdbAdapter } from "./tmdb.adapter";
import { TmdbProcessor } from "./tmdb.processor";

@Module({
  controllers: [ScrapperController],
  providers: [ScrapperService, TmdbProcessor, TmdbAdapter],
  imports: [
    BullModule.registerQueue({
      name: ProcessorType.TMDB,
      limiter: { max: 1, duration: 100 },
    }),
    BullBoardModule.forFeature({
      name: ProcessorType.TMDB,
      adapter: BullAdapter,
    }),
    CatalogModule,
  ],
})
export class ScrapperModule {}
