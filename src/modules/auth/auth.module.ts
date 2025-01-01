import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '@modules/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passport/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TAuthConfig } from '@src/config/auth.config';
import { JwtStrategy } from './passport/jwt.strategy';
import { TokenService } from './services/token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { RoleModule } from '@modules/role/role.module';
import { Otp } from './entities/opt.entity';
import { OtpService } from './services/otp.service';
import { EmailModule } from '@modules/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Token, Otp]),
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<TAuthConfig>('auth').jwtSecretKey,
        signOptions: {
          expiresIn: configService.get<TAuthConfig>('auth').accessTokenExpireIn,
        },
      }),
      inject: [ConfigService],
    }),
    RoleModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    OtpService,
    LocalStrategy,
    JwtStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
