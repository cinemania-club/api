import { IsUUID } from "class-validator";

export class UserCreateDto {
  @IsUUID()
  uuid: string;
}
