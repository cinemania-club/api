import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import * as Joi from "joi";
import { MONGO_URL } from "src/constants";
import { CatalogWorker } from "../catalog/worker/catalog.worker";
import { ScrapperModule } from "./scrapper/scrapper.module";

const ENABLE_ENV_VALIDATION = null;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: ENABLE_ENV_VALIDATION,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid("production", "development", "test")
          .required(),
      }),
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(MONGO_URL),
    ScrapperModule,
    CatalogWorker,
  ],
})
export class WorkerModule {}
