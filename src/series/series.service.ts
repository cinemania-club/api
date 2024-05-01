import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Series } from "./series.schema";

type UnpersistedSeries = Omit<Series, "loadedAt">;

@Injectable()
export class SeriesService {
  constructor(@InjectModel(Series.name) private seriesModel: Model<Series>) {}

  async saveSeries(series: UnpersistedSeries) {
    await this.seriesModel.updateOne(
      { _id: series._id },
      { ...series, loadedAt: new Date() },
      { upsert: true },
    );
  }
}
