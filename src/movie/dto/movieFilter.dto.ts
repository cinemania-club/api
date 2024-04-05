export class MovieFilterDto {
  minRuntime: number;
  maxRuntime: number;

  minReleaseDate: string;
  maxReleaseDate: string;

  genres: number[];
  requiredGenres: number[];

  orderBy: OrderBy;
}

export enum OrderBy {
  CREATED_AT_ASC = "CREATED_AT_ASC",
  CREATED_AT_DESC = "CREATED_AT_DESC",
  RELEASE_DATE_ASC = "RELEASE_DATE_ASC",
  RELEASE_DATE_DESC = "RELEASE_DATE_DESC",
}
