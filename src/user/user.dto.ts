import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SearchDto {
  @IsString()
  @IsNotEmpty()
  query!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skip?: string[];
}
