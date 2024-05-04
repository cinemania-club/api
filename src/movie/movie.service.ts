import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { MOVIES_PAGE_SIZE } from "src/constants";
import { $and, $criteria } from "src/mongo";
import { Movie } from "src/movie/movie.schema";
import { MovieVote } from "./movie-vote.schema";
import { MovieFiltersDto, SortCriteria } from "./movie.dto";

type Catalog = {
  total: number;
  items: Movie[];
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

const DEFAULT_SORT_CRITERIA = SortCriteria.POPULARITY_DESC;

@Injectable()
export class MovieService {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<Movie>,
    @InjectModel(MovieVote.name) private movieVoteModel: Model<MovieVote>,
  ) {}

  async getMovies(filters: MovieFiltersDto, userId: Types.ObjectId) {
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
    const [result] = await this.movieModel.aggregate<Catalog>([
      { $match: filter },
      {
        $facet: {
          total: [{ $count: "count" }],
          items: [
            { $match: skipPreviousResults },
            { $sort: SORT_QUERY[sortCriteria] },
            { $limit: MOVIES_PAGE_SIZE },
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

    const movieIds = result.items.map((movie) => movie._id);
    const userVotes = await this.movieVoteModel.find({
      userId: userId,
      movieId: { $in: movieIds },
    });

    result.items = result.items.map((movie) => ({
      ...movie,
      userVote: userVotes.find((vote) => vote.movieId === movie._id)?.stars,
    }));

    return result;
  }
}
