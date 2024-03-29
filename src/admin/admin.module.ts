import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { ScrapperScheduler } from "src/worker/scrapper/scrapper.scheduler";
import { AdminController } from "./admin.controller";

@Module({
  imports: [
    BullModule.forRoot({ redis: { host: "redis", port: 6379 } }),
    BullModule.registerQueue({ name: "tmdb" }),
  ],
  controllers: [AdminController],
  providers: [ScrapperScheduler],
})
export class AdminModule {}
