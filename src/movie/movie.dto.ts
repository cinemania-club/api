import { IsArray, IsInt, IsNumberString, IsString } from "class-validator";

export class SearchDto {
  @IsString()
  query: string;

  @IsArray()
  @IsInt({ each: true })
  skip: number[];
}

export class MovieDetailsDto {
  @IsNumberString()
  id: number;
}
