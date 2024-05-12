import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UserDto {
  @IsString()
  @IsNotEmpty()
  id!: string;
}

export class SearchDto {
  @IsString()
  @IsNotEmpty()
  query!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skip?: string[];
}

export class SetStreamingsDto {
  @IsArray()
  @IsString({ each: true })
  streamings!: string[];
}
