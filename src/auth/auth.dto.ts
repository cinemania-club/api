import { IsUUID } from "class-validator";

export class CreateAuthDto {
  @IsUUID()
  uuid!: string;
}
