import { IsUUID } from "class-validator";

export class CreateUserDto {
  @IsUUID()
  uuid!: string;
}
