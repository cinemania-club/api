import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { REDIS_URL } from "src/constants";
import { ScrapperScheduler } from "src/worker/scrapper/scrapper.scheduler";
import { ScrapperController } from "./admin.controller";

@Module({
  imports: [
    BullModule.forRoot({ redis: REDIS_URL }),
    BullModule.registerQueue({ name: "tmdb" }),
  ],
  controllers: [ScrapperController],
  providers: [ScrapperScheduler],
})
export class AdminModule {}
