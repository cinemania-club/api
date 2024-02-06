import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { MovieModule } from "src/movie/movie.module";
import { ScrapperScheduler } from "src/worker/scrapper/scrapper.scheduler";
import { AdminController } from "./admin.controller";

@Module({
  imports: [
    BullModule.forRoot({ redis: { host: "redis", port: 6379 } }),
    BullModule.registerQueue({ name: "tmdb" }),
    MovieModule,
  ],
  controllers: [AdminController],
  providers: [ScrapperScheduler],
})
export class AdminModule {}
