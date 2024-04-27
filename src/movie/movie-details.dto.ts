import { IsNumberString } from "class-validator";

export class MovieDetailsDto {
  @IsNumberString()
  id: number;
}
