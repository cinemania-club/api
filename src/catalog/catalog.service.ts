import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { $and, $criteria, $eq } from "src/mongo";
import { RatingService } from "src/rating/rating.service";
import { SearchService } from "src/search/search.service";
import { FilterCatalogDto, SearchDto } from "./catalog.dto";
import { DEFAULT_SORT_CRITERIA, PAGE_SIZE } from "./constants";
import { CatalogItem, CatalogItemFormat } from "./item.schema";
import { SortCriteria } from "./types";

type Catalog = {
  total: number;
  items: CatalogItem[];
};

const SORT_QUERY: Record<SortCriteria, Record<string, 1 | -1>> = {
  [SortCriteria.RATING_ASC]: { hasRating: -1, rating: 1 },
  [SortCriteria.RATING_DESC]: { hasRating: -1, rating: -1 },
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
    private ratingService: RatingService,
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

    const addHasRating = [
      { $set: { rating: { $ifNull: ["$rating", null] } } },
      { $addFields: { hasRating: { $ne: ["$rating", null] } } },
    ];

    const sortCriteria = filters.sort || DEFAULT_SORT_CRITERIA;
    const [result] = await this.catalogModel.aggregate<Catalog>([
      { $match: filter },
      {
        $facet: {
          total: [{ $count: "count" }],
          items: [
            { $match: skipPreviousResults },
            ...addHasRating,
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

    result.items = await this.addRatings(result.items, userId);
    return result;
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

  async addRatings(items: CatalogItem[], userId: Types.ObjectId) {
    const ids = items.map((item) => item._id);
    const ratings = await this.ratingService.getUserRatings(ids, userId);

    return items.map((item) => ({
      ...item,
      ratings: {
        general: item.rating,
        user: ratings.find((e) => $eq(e.itemId, item._id))?.stars,
      },
    }));
  }
}
