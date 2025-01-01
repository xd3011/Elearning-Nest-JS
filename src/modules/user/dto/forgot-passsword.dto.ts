import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ConfirmPasswordDto extends ForgotPasswordDto {
  @IsNotEmpty()
  code: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  newPassword: string;
}
