import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import { MONGO_URL } from "src/constants";
import { CatalogWorker } from "../catalog/worker/catalog.worker";
import { ScrapperModule } from "./scrapper/scrapper.module";

const ENABLE_ENV_VALIDATION = undefined;

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(MONGO_URL),
    ScrapperModule,
    CatalogWorker,
  ],
})
export class WorkerModule {}
