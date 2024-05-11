import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  IsUUID,
} from "class-validator";

export class CreateAuthDto {
  @IsUUID()
  uuid!: string;
}

export class SignUpDto {
  @IsEmail()
  email!: string;

  @IsPhoneNumber("BR")
  @IsOptional()
  phone?: string;

  @IsString()
  name!: string;

  @IsString()
  username!: string;

  @IsStrongPassword()
  password!: string;
}

export class SignInDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
