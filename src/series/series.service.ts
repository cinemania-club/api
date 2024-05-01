import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { sub } from "date-fns";
import { difference } from "lodash";
import { Model } from "mongoose";
import { SERIES_FRESHNESS_DURATION } from "./series.constants";
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

  async getOutdated(ids: number[]) {
    const freshnessDate = sub(new Date(), SERIES_FRESHNESS_DURATION);
    const upToDateSeries = await this.seriesModel.aggregate<{ _id: number }>([
      {
        $match: {
          _id: { $in: ids },
          loadedAt: { $gte: freshnessDate },
        },
      },
      { $project: { _id: 1 } },
    ]);

    const upToDateIds = upToDateSeries.map((series) => series._id);
    const outdatedIds = difference(ids, upToDateIds);

    return outdatedIds;
  }
}
