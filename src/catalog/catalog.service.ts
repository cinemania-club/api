import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SearchService } from "src/catalog/search.service";
import { LIST_PAGE_SIZE } from "src/constants";
import { $and, $criteria, $oid, Oid } from "src/mongo";
import { FilterCatalogDto, SearchDto } from "./catalog.dto";
import { DEFAULT_SORT_CRITERIA } from "./constants";
import { CatalogHydration } from "./hydration.service";
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
    private searchService: SearchService,
    private catalogHydration: CatalogHydration,
  ) {}

  async getCatalog(filters: FilterCatalogDto, userId: Oid) {
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
      { _id: { $nin: filters.skip?.map((e) => $oid(e)) } },
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
    const [query] = await this.catalogModel.aggregate<Catalog>([
      { $match: filter },
      {
        $facet: {
          total: [{ $count: "count" }],
          items: [
            { $match: skipPreviousResults },
            ...addHasRating,
            { $sort: SORT_QUERY[sortCriteria] },
            { $limit: LIST_PAGE_SIZE },
            { $project: { _id: 1 } },
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

    const oids = query.items.map((item) => item._id);
    const hydration = await this.catalogHydration.hydrateItems(oids, userId);

    return {
      ...query,
      ...hydration,
    };
  }

  async search(userId: Oid, format: CatalogItemFormat, dto: SearchDto) {
    const ids = await this.searchService.searchCatalogItem(
      format,
      dto.query,
      dto.skip,
    );

    const oids = ids.map((id) => $oid(id));
    return await this.catalogHydration.hydrateItems(oids, userId);
  }
}
