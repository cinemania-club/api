import { IsArray, IsString } from "class-validator";

export class PlaylistDto {
  @IsString()
  id: string;
}

export class CreatePlaylistDto {
  @IsString()
  name: string;
}

export class AddItemDto {
  @IsString()
  itemId: string;

  @IsArray()
  @IsString({ each: true })
  playlists: string[];
}
