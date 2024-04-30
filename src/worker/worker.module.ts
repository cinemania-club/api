import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import * as Joi from "joi";
import { isWorker, MONGO_URL } from "src/constants";
import { ScrapperModule } from "./scrapper/scrapper.module";

// The following code is a workaround to disable worker env validation in ApiModule context
const ENABLE_ENV_VALIDATION = null;
const DISABLE_ENV_VALIDATION = () => ({});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: isWorker ? ENABLE_ENV_VALIDATION : DISABLE_ENV_VALIDATION,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid("production", "development", "test")
          .required(),
      }),
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(MONGO_URL),
    ScrapperModule,
  ],
})
export class WorkerModule {}
