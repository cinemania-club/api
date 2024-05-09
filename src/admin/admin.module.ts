import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { ScrapperAdminController } from "./scrapper.controller";

@Module({
  imports: [BullModule.registerQueue({ name: "tmdb" })],
  controllers: [ScrapperAdminController],
  providers: [],
})
export class AdminModule {}
