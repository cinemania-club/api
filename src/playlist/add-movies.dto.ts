import { IsArray, IsNumber, IsString } from "class-validator";

export class AddMoviesDto {
  @IsNumber()
  movieId: number;

  @IsArray()
  @IsString({ each: true })
  playlists: string[];
}
