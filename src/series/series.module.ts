import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Series, SeriesSchema } from "./series.schema";
import { SeriesService } from "./series.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Series.name, schema: SeriesSchema }]),
  ],
  exports: [SeriesService],
  providers: [SeriesService],
})
export class SeriesModule {}
