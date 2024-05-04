import { IsArray, IsInt, IsString } from "class-validator";

export class SearchDto {
  @IsString()
  query: string;

  @IsArray()
  @IsInt({ each: true })
  skip: number[];
}
