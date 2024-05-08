import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { REDIS_URL } from "src/constants";
import { ScrapperAdminController } from "./scrapper.controller";

@Module({
  imports: [
    BullModule.forRoot({ redis: REDIS_URL }),
    BullModule.registerQueue({ name: "tmdb" }),
  ],
  controllers: [ScrapperAdminController],
  providers: [],
})
export class AdminModule {}
