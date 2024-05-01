import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SeriesRepository } from "./series.repository";
import { Series, SeriesSchema } from "./series.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Series.name, schema: SeriesSchema }]),
  ],
  exports: [SeriesRepository],
  providers: [SeriesRepository],
})
export class SeriesModule {}
