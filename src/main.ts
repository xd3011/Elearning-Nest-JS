import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CLogger } from './logger/custom-loger';
import { ConfigService } from '@nestjs/config';
import { TAppConfig } from './config/app.config';
import { VersioningType } from '@nestjs/common';
import { GlobalExceptionsFilter } from './filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const host = configService.getOrThrow<TAppConfig>('app').host;
  const port = configService.getOrThrow<TAppConfig>('app').port;
  const apiPrefix = configService.getOrThrow<TAppConfig>('app').apiPrefix;
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
