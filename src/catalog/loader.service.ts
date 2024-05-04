import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { sub } from "date-fns";
import { difference, pick } from "lodash";
import { Model } from "mongoose";
import { IndexerService } from "src/indexer/indexer.service";
import { CATALOG_ITEM_FRESHNESS } from "./constants";
import { CatalogItem, CatalogItemFormat } from "./item.schema";

type UnpersistedItem = Omit<CatalogItem, "_id" | "loadedAt">;

@Injectable()
export class LoaderService {
  constructor(
    @InjectModel(CatalogItem.name) private catalogItemModel: Model<CatalogItem>,
    private indexerService: IndexerService,
  ) {}

  async getOutdated(format: CatalogItemFormat, ids: number[]) {
    const freshnessDate = sub(new Date(), CATALOG_ITEM_FRESHNESS);
    const upToDateItems = await this.catalogItemModel.aggregate<{
      id: number;
    }>([
      {
        $match: {
          format,
          id: { $in: ids },
          loadedAt: { $gte: freshnessDate },
        },
      },
      { $project: { id: 1 } },
    ]);

    const upToDateIds = upToDateItems.map((item) => item.id);
    const outdatedIds = difference(ids, upToDateIds);

    return outdatedIds;
  }

  async load(item: UnpersistedItem) {
    const result = await this.catalogItemModel.findOneAndUpdate(
      pick(item, "format", "id"),
      { ...item, loadedAt: new Date() },
      { upsert: true, new: true },
    );

    await this.indexerService.indexCatalogItem(result);
  }
}
