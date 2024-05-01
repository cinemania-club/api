import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Series } from "./series.schema";

@Injectable()
export class SeriesService {
  constructor(@InjectModel(Series.name) private seriesModel: Model<Series>) {}

  async saveSeries(series: Series) {
    await this.seriesModel.updateOne({ _id: series._id }, series, {
      upsert: true,
    });
  }
}
