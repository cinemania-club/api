import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { MovieModule } from "src/movie/movie.module";
import { ScrapperScheduler } from "./scrapper.scheduler";
import { ScrapperService } from "./scrapper.service";
import { TmdbAdapter } from "./tmdb.adapter";
import { TmdbProcessor } from "./tmdb.processor";

@Module({
  imports: [
    BullModule.forRoot({ redis: { host: "redis", port: 6379 } }),
    BullModule.registerQueue({
      name: "tmdb",
      limiter: { max: 1, duration: 1000 },
    }),
    MovieModule,
  ],
  providers: [ScrapperService, TmdbProcessor, TmdbAdapter, ScrapperScheduler],
})
export class ScrapperModule {}
