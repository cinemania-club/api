import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { $and, $criteria, $eq } from "src/mongo";
import { SearchService } from "src/search/search.service";
import { FilterCatalogDto, SearchDto } from "./catalog.dto";
import { DEFAULT_SORT_CRITERIA, PAGE_SIZE } from "./constants";
import { CatalogItem, CatalogItemFormat } from "./item.schema";
import { Rating } from "./rating.schema";
import { SortCriteria } from "./types";

type Catalog = {
  total: number;
  items: CatalogItem[];
};

const SORT_QUERY: Record<SortCriteria, Record<string, 1 | -1>> = {
  [SortCriteria.RATING_ASC]: { vote_average: 1 },
  [SortCriteria.RATING_DESC]: { vote_average: -1 },
  [SortCriteria.POPULARITY_ASC]: { popularity: 1 },
  [SortCriteria.POPULARITY_DESC]: { popularity: -1 },
  [SortCriteria.RELEASE_DATE_ASC]: { release_date: 1 },
  [SortCriteria.RELEASE_DATE_DESC]: { release_date: -1 },
  [SortCriteria.CREATED_AT_ASC]: { createdAt: 1 },
  [SortCriteria.CREATED_AT_DESC]: { createdAt: -1 },
};

@Injectable()
export class CatalogService {
  constructor(
    @InjectModel(CatalogItem.name) private catalogModel: Model<CatalogItem>,
    @InjectModel(Rating.name) private ratingModel: Model<Rating>,
    private searchService: SearchService,
  ) {}

  async getCatalog(filters: FilterCatalogDto, userId: Types.ObjectId) {
    const filterFormats = $criteria(
      { format: { $in: filters.formats } },
      !!filters.formats?.length,
    );

    const filterStreamings = $criteria(
      { streamings: { $elemMatch: { $in: filters.streamings } } },
      !!filters.streamings?.length,
    );

    const filterGenres = $criteria(
      { genres: { $elemMatch: { $in: filters.genres } } },
      !!filters.genres?.length,
    );

    const filterRequiredGenres = $and(
      filters.requiredGenres?.map((genre) => ({
        genres: { $elemMatch: { $eq: genre } },
      })),
    );

    const filterRuntimeMin = $criteria(
      { runtime: { $gte: filters.runtimeMin } },
      !!filters.runtimeMin,
    );

    const filterRuntimeMax = $criteria(
      { runtime: { $lte: filters.runtimeMax } },
      !!filters.runtimeMax,
    );

    const airDateMax = filters.airDateMax && new Date(filters.airDateMax);
    const filterFirstAirDate = $criteria(
      { firstAirDate: { $lte: airDateMax } },
      !!airDateMax,
    );

    const airDateMin = filters.airDateMin && new Date(filters.airDateMin);
    const filterLastAirDate = $criteria(
      { lastAirDate: { $gte: airDateMin } },
      !!airDateMin,
    );

    const filterOriginalLanguage = $criteria(
      { original_language: { $in: filters.originalLanguage } },
      !!filters.originalLanguage?.length,
    );

    const filterSpokenLanguage = $criteria(
      { spoken_languages: { $elemMatch: { $in: filters.spokenLanguage } } },
      !!filters.spokenLanguage?.length,
    );

    const filterOriginCountry = $criteria(
      { origin_country: { $elemMatch: { $in: filters.originCountry } } },
      !!filters.originCountry?.length,
    );

    const filterProductionCountries = $criteria(
      {
        production_countries: {
          $elemMatch: { $in: filters.productionCountries },
        },
      },
      !!filters.productionCountries?.length,
    );

    const filterProductionCompanies = $criteria(
      {
        production_companies: {
          $elemMatch: { $in: filters.productionCompanies },
        },
      },
      !!filters.productionCompanies?.length,
    );

    const skipPreviousResults = $criteria(
      { _id: { $nin: filters.skip.map((e) => new Types.ObjectId(e)) } },
      !!filters.skip?.length,
    );

    const filter = $and([
      filterFormats,
      filterStreamings,
      filterGenres,
      filterRequiredGenres,
      filterRuntimeMin,
      filterRuntimeMax,
      filterFirstAirDate,
      filterLastAirDate,
      filterOriginalLanguage,
      filterSpokenLanguage,
      filterOriginCountry,
      filterProductionCountries,
      filterProductionCompanies,
    ]);

    const sortCriteria = filters.sort || DEFAULT_SORT_CRITERIA;
    const [result] = await this.catalogModel.aggregate<Catalog>([
      { $match: filter },
      {
        $facet: {
          total: [{ $count: "count" }],
          items: [
            { $match: skipPreviousResults },
            { $sort: SORT_QUERY[sortCriteria] },
            { $limit: PAGE_SIZE },
          ],
        },
      },
      {
        $project: {
          total: { $arrayElemAt: ["$total.count", 0] },
          items: 1,
        },
      },
    ]);

    return {
      ...result,
      items: await this.addRatings(result.items, userId),
    };
  }

  async getCatalogItem(itemId: Types.ObjectId, userId: Types.ObjectId) {
    const doc = await this.catalogModel.findById(itemId).lean();
    if (!doc) return { item: null };

    const [item] = await this.addRatings([doc], userId);
    return item;
  }

  async search(format: CatalogItemFormat, dto: SearchDto) {
    const ids = await this.searchService.searchCatalogItem(
      format,
      dto.query,
      dto.skip,
    );

    const items = await this.catalogModel.find({ _id: { $in: ids } });

    return ids
      .map((id) => items.find((e) => e._id.toString() === id))
      .filter((e) => e);
  }

  // PRIVATE METHODS

  private async addRatings(items: CatalogItem[], userId: Types.ObjectId) {
    const itemIds = items.map((item) => item._id);
    const ratings = await this.ratingModel.find({
      userId,
      itemId: { $in: itemIds },
    });

    return items.map((item) => ({
      ...item,
      rating: {
        all: this.normalizeVote(item.voteAverage),
        user: ratings.find((rating) => $eq(rating.itemId, item._id))?.stars,
      },
    }));
  }

  private normalizeVote(vote: number, min = 1, max = 10) {
    return (4 * (vote - min)) / (max - min) + 1;
  }
}
