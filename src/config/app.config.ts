import { registerAs } from '@nestjs/config';

import { IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

import validateConfig from '@shared/validator-config';

// export enum ENodeEnv {
//   DEVELOPMENT = 'development',
//   PRODUCTION = 'production',
// }

export type TAppConfig = {
  //   nodeEnv: ENodeEnv;
  host: string;
  port: number;
  //   enableTLS: boolean;
  //   sslCertPath: string;
  //   sslKeyPath: string;
  apiPrefix: string;
};

class AppConfigValidator {
  @IsUrl()
  @IsOptional()
  HOST?: string;

  @IsInt()
  @IsOptional()
  PORT?: number;

  @IsString()
  @IsOptional()
  API_PREFIX?: string;

  //   @IsBoolean()
  //   @IsOptional()
  //   ENABLE_TLS?: boolean;

  //   @IsString()
  //   @IsOptional()
  //   SSL_CERT_PATH?: string;

  //   @IsString()
  //   @IsOptional()
  //   SSL_KEY_PATH?: string;

  //   @IsString()
  //   @IsOptional()
  //   YOOTEK_BACKEND_URL?: string;

  //   @IsString()
  //   @IsOptional()
  //   AIBOX_BACKEND_URL?: string;
}

export default registerAs<TAppConfig>('app', () => {
  validateConfig(process.env, AppConfigValidator);

  return {
    // nodeEnv: (process.env.NODE_ENV as ENodeEnv) || ENodeEnv.DEVELOPMENT,
    host: process.env.HOST || 'localhost',
    port: parseInt(process.env.PORT) || 5000,
    apiPrefix: process.env.API_PREFIX || 'api',
    // enableTLS: process.env.ENABLE_TLS === 'true',
    // sslCertPath: process.env.SSL_CERT_PATH,
    // sslKeyPath: process.env.SSL_KEY_PATH,
  };
});
