import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  Max,
  Min,
} from "class-validator";

export enum OrderBy {
  CREATED_AT_ASC = "CREATED_AT_ASC",
  CREATED_AT_DESC = "CREATED_AT_DESC",
  RELEASE_DATE_ASC = "RELEASE_DATE_ASC",
  RELEASE_DATE_DESC = "RELEASE_DATE_DESC",
}

export class MovieFiltersDto {
  @IsInt()
  @Min(0)
  @Max(600)
  minRuntime: number;
  @IsInt()
  @Min(0)
  @Max(600)
  maxRuntime: number;

  @IsDateString()
  minReleaseDate: string;
  @IsDateString()
  maxReleaseDate: string;

  @IsArray()
  genres: number[];
  @IsArray()
  requiredGenres: number[];

  @IsEnum(OrderBy)
  orderBy: OrderBy;

  @IsArray()
  skip: number[];
}
