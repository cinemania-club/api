import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

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
