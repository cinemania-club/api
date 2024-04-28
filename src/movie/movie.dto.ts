import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export enum SortCriteria {
  RATING_ASC = "RATING_ASC",
  RATING_DESC = "RATING_DESC",
  POPULARITY_ASC = "POPULARITY_ASC",
  POPULARITY_DESC = "POPULARITY_DESC",
  RELEASE_DATE_ASC = "RELEASE_DATE_ASC",
  RELEASE_DATE_DESC = "RELEASE_DATE_DESC",
  CREATED_AT_ASC = "CREATED_AT_ASC",
  CREATED_AT_DESC = "CREATED_AT_DESC",
}

export class MovieFiltersDto {
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  streamings: number[];

  @IsInt()
  @Min(0)
  @IsOptional()
  minRuntime: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  maxRuntime: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  genres: number[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  requiredGenres: number[];

  @IsDateString()
  @IsOptional()
  minReleaseDate: string;

  @IsDateString()
  @IsOptional()
  maxReleaseDate: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  originalLanguage: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  spokenLanguage: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  originCountry: number[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  productionCountries: number[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  productionCompanies: number[];

  @IsArray()
  @IsInt({ each: true })
  skip: number[];

  @IsEnum(SortCriteria)
  sort: SortCriteria;
}

export class MovieDetailsDto {
  @IsNumberString()
  id: number;
}

export class VoteMovieDto {
  @IsInt()
  movieId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  stars?: number;
}
