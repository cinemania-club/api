import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { $and, $criteria } from "src/mongo";
import { FilterCatalogDto } from "./catalog.dto";
import { DEFAULT_SORT_CRITERIA, PAGE_SIZE } from "./constants";
import { CatalogItem } from "./item.schema";
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
  ) {}

  async getCatalog(filters: FilterCatalogDto, userId: Types.ObjectId) {
    const filterStreamings = $criteria(
      {
        "watch/providers.results.BR.flatrate": {
          $elemMatch: { provider_id: { $in: filters.streamings } },
        },
      },
      !!filters.streamings?.length,
    );

    const filterMinRuntime = $criteria(
      { runtime: { $gte: filters.minRuntime } },
      !!filters.minRuntime,
    );

    const filterMaxRuntime = $criteria(
      { runtime: { $lte: filters.maxRuntime } },
      !!filters.maxRuntime,
    );

    const filterGenres = $criteria(
      { genres: { $elemMatch: { id: { $in: filters.genres } } } },
      !!filters.genres?.length,
    );

    const filterRequiredGenres = $and(
      filters.requiredGenres?.map((genreId) => ({
        genres: { $elemMatch: { id: genreId } },
      })),
    );

    const minReleaseDate =
      filters.minReleaseDate && new Date(filters.minReleaseDate);
    const filterMinReleaseDate = $criteria(
      { release_date: { $gte: minReleaseDate } },
      !!filters.minReleaseDate,
    );

    const maxReleaseDate =
      filters.maxReleaseDate && new Date(filters.maxReleaseDate);
    const filterMaxReleaseDate = $criteria(
      { release_date: { $lte: maxReleaseDate } },
      !!filters.maxReleaseDate,
    );

    const filterOriginalLanguage = $criteria(
      { original_language: { $in: filters.originalLanguage } },
      !!filters.originalLanguage?.length,
    );

    const filterSpokenLanguage = $criteria(
      {
        spoken_languages: {
          $elemMatch: { iso_639_1: { $in: filters.spokenLanguage } },
        },
      },
      !!filters.spokenLanguage?.length,
    );

    const filterOriginCountry = $criteria(
      { origin_country: { $elemMatch: { $in: filters.originCountry } } },
      !!filters.originCountry?.length,
    );

    const filterProductionCountries = $criteria(
      {
        production_countries: {
          $elemMatch: { iso_3166_1: { $in: filters.productionCountries } },
        },
      },
      !!filters.productionCountries?.length,
    );

    const filterProductionCompanies = $criteria(
      {
        production_companies: {
          $elemMatch: { id: { $in: filters.productionCompanies } },
        },
      },
      !!filters.productionCompanies?.length,
    );

    const skipPreviousResults = $criteria(
      { _id: { $nin: filters.skip } },
      !!filters.skip,
    );

    const skipAdult = { adult: false };
    const filter = $and([
      filterStreamings,
      filterMinRuntime,
      filterMaxRuntime,
      filterGenres,
      filterRequiredGenres,
      filterMinReleaseDate,
      filterMaxReleaseDate,
      filterOriginalLanguage,
      filterSpokenLanguage,
      filterOriginCountry,
      filterProductionCountries,
      filterProductionCompanies,
      skipAdult,
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

    const itemIds = result.items.map((item) => item._id);
    const ratings = await this.ratingModel.find({
      userId,
      itemId: { $in: itemIds },
    });

    result.items = result.items.map((item) => ({
      ...item,
      userRating: ratings.find((rating) => rating.itemId === item._id)?.stars,
    }));

    return result;
  }
}
