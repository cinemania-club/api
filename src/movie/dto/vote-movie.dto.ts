import { IsInt, IsOptional, Max, Min } from "class-validator";

export enum OrderBy {
  CREATED_AT_ASC = "CREATED_AT_ASC",
  CREATED_AT_DESC = "CREATED_AT_DESC",
  RELEASE_DATE_ASC = "RELEASE_DATE_ASC",
  RELEASE_DATE_DESC = "RELEASE_DATE_DESC",
}

export class VoteMovieDto {
  @IsInt()
  movieId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  stars: number;
}
