import { Module } from "@nestjs/common";
import { ScrapperModule } from "src/worker/scrapper/scrapper.module";
import { ScrapperController } from "./admin.controller";

@Module({
  imports: [ScrapperModule],
  controllers: [ScrapperController],
  providers: [],
})
export class AdminModule {}
