import { IsEmail, isNotEmpty, IsNotEmpty, IsString } from 'class-validator';

export class CreateAuthDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  refresh_token: string;

  @IsNotEmpty()
  verify_token?: string;
}
