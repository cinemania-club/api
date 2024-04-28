import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
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
  @IsOptional()
  minRuntime: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  maxRuntime: number;

  @IsArray()
  @IsOptional()
  genres: number[];

  @IsArray()
  @IsOptional()
  requiredGenres: number[];

  @IsDateString()
  @IsOptional()
  minReleaseDate: string;

  @IsDateString()
  @IsOptional()
  maxReleaseDate: string;

  @IsArray()
  skip: number[];

  @IsEnum(OrderBy)
  orderBy: OrderBy;
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
