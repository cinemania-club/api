import { IsString } from "class-validator";

export class DeletePlaylistDto {
  @IsString()
  id: string;
}
