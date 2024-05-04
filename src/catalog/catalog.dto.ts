import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { SortCriteria } from "./types";

export class FilterCatalogDto {
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
  @IsOptional()
  skip: number[];

  @IsEnum(SortCriteria)
  @IsOptional()
  sort: SortCriteria;
}

export class CatalogItemDto {
  @IsString()
  id: string;
}

export class RatingDto {
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  stars?: number;
}
