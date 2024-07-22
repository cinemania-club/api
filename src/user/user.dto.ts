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
  @IsNotEmpty({ message: "Nome de usuário é obrigatório" })
  username!: string;

  @IsEmail({}, { message: "Email inválido" })
  email!: string;

  @IsStrongPassword({}, { message: "Escolha uma senha mais forte" })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: "Nome é obrigatório" })
  name!: string;

  @IsPhoneNumber("BR", { message: "Telefone inválido" })
  @IsOptional()
  phone?: string;
}

export class SignInDto {
  @IsEmail({}, { message: "Email inválido" })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "Senha é obrigatória" })
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
