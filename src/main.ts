import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { CLogger } from './logger/custom-loger';
import { ConfigService } from '@nestjs/config';
import { TAppConfig } from './config/app.config';
import { NestApplicationOptions, VersioningType } from '@nestjs/common';
import { GlobalExceptionsFilter } from './filters/global-exception.filter';
import * as cookieParser from 'cookie-parser';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

async function bootstrap() {
  const options: NestApplicationOptions = {
    cors: true,
    logger: CLogger,
  };
  const app = await NestFactory.create(AppModule, options);
  const configService = app.get(ConfigService);
  const host = configService.getOrThrow<TAppConfig>('app').host;
  const port = configService.getOrThrow<TAppConfig>('app').port;
  const apiPrefix = configService.getOrThrow<TAppConfig>('app').apiPrefix;
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.use(cookieParser());
  app.setGlobalPrefix(apiPrefix);
  app.useGlobalFilters(new GlobalExceptionsFilter());
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1'],
  });
  await app.listen(port, host, () => {
    CLogger.log(`Server is running on ${host}:${port}`, 'Bootstrap');
  });
}
bootstrap();
