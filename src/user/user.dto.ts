import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  IsUUID,
} from "class-validator";

export class AnonymousUserDto {
  @IsUUID()
  uuid!: string;
}

export class SignUpDto {
  @IsString()
  username!: string;

  @IsEmail()
  email!: string;

  @IsStrongPassword()
  password!: string;

  @IsString()
  name!: string;

  @IsPhoneNumber("BR")
  @IsOptional()
  phone?: string;
}

export class SignInDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

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
