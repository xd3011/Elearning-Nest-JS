import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { IsInt, IsOptional, IsString, IsUrl } from 'class-validator';
import validateConfig from '../shared/validator-config';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

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

const TDBConfig = () => {
  validateConfig(process.env, AppConfigValidator);
  return {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT) || 5000,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    db: process.env.POSTGRES_DB,
  };
};

const dbConfig = TDBConfig();

const config = {
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.db,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/src/migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: false,
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
