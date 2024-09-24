import { registerAs } from '@nestjs/config';

import { IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

import validateConfig from '@shared/validator-config';

export type TDBConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  db: string;
};

class AppConfigValidator {
  @IsUrl()
  @IsOptional()
  POSTGRES_HOST?: string;

  @IsInt()
  @IsOptional()
  POSTGRES_PORT?: number;

  @IsString()
  @IsOptional()
  POSTGRES_USER?: string;

  @IsString()
  @IsOptional()
  POSTGRES_PASSWORD?: string;

  @IsString()
  @IsOptional()
  POSTGRES_DB?: string;
}

export default registerAs<TDBConfig>('db', () => {
  validateConfig(process.env, AppConfigValidator);
  return {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT) || 5000,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    db: process.env.POSTGRES_DB,
  };
});
