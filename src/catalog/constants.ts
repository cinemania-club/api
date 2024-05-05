import { SortCriteria } from "./types";

export const ONBOARDING_TARGET_RATINGS = 1;
export const PAGE_SIZE = 100;
export const DEFAULT_SORT_CRITERIA = SortCriteria.POPULARITY_DESC;

export const CATALOG_FIELDS = [
  "_id",
  "format",
  "posterPath",
  "title",
  "overview",
  "genres",
  "runtime",
  "firstAirDate",
  "lastAirDate",
  "ratings",
];

export const CATALOG_ITEM_FIELDS = [
  "_id",
  "format",
  "backdropPath",
  "title",
  "genres",
  "runtime",
  "firstAirDate",
  "lastAirDate",
  "ratings",
];

export const CATALOG_ITEM_FRESHNESS = { days: 7 };
