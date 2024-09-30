import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TDBConfig } from 'src/config/dbConfig';
import { User } from '@modules/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<TDBConfig>('db').host,
        port: configService.get<TDBConfig>('db').port,
        username: configService.get<TDBConfig>('db').user,
        password: configService.get<TDBConfig>('db').password,
        database: configService.get<TDBConfig>('db').db,
        entities: [__dirname + '/../src/modules/**/entities/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: true,
        migrations: ['src/migration/**/*.ts'],
      }),
    }),
    TypeOrmModule.forFeature([User]),
  ],
})
export class DatabaseModule {}
