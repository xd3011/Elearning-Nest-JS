import { registerAs } from '@nestjs/config';

import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import validateConfig from '@shared/validator-config';

export type TEmailConfig = {
  emailHost: string;
  emailAuthUser: string;
  emailAuthPass: string;
  emailPreview: boolean;
};

class EmailConfigValidator {
  @IsString()
  @IsNotEmpty()
  EMAIL_HOST: string;

  @IsString()
  @IsNotEmpty()
  EMAIL_AUTH_USER: string;

  @IsString()
  @IsNotEmpty()
  EMAIL_AUTH_PASS: string;

  @IsBoolean()
  @IsOptional()
  EMAIL_PREVIEW?: boolean;
}

export default registerAs<TEmailConfig>('email', () => {
  validateConfig(process.env, EmailConfigValidator);
  return {
    emailHost: process.env.EMAIL_HOST,
    emailAuthUser: process.env.EMAIL_AUTH_USER,
    emailAuthPass: process.env.EMAIL_AUTH_PASS,
    emailPreview: process.env.EMAIL_PREVIEW === 'true',
  };
});
