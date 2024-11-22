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
import { GroupModule } from './modules/group/group.module';
import { ChatModule } from './modules/chat/chat.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule } from './modules/permission/permission.module';
import typeormConfig from './config/typeorm.config';
import { WSModule } from './ws/ws.module';
import { CacheModule } from '@nestjs/cache-manager';
import { PostModule } from './modules/post/post.module';

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
    GroupModule,
    ChatModule,
    RoleModule,
    PermissionModule,
    WSModule,
    CacheModule.register({ isGlobal: true, ttl: 0 }),
    PostModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
