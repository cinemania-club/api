import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import * as Joi from "joi";
import { ScrapperModule } from "./scrapper/scrapper.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid("production", "development", "test"),
      }),
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot("mongodb://mongo/cinemania"),
    ScrapperModule,
  ],
})
export class WorkerModule {}
