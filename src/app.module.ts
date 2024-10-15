import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import dbConfig from './config/dbConfig';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import typeormConfig from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, dbConfig, typeormConfig],
      envFilePath: ['.env', '.env.development', '.env.production'],
    }),
    DatabaseModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
