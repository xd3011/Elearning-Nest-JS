import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { TAuthConfig } from '@src/config/auth.config';
import { TConfigs } from '@src/config';

import { ApiResponseCode } from '@shared/constants/api-response-code.constant';
import { CUnauthorizedException } from '@shared/custom-http-exception';
import { IUser } from '@modules/user/interface/user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService<TConfigs>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<TAuthConfig>('auth').jwtSecretKey,
    });
  }

  async validate(payload: IUser) {
    const { id, email } = payload;

    if (!id) {
      throw new CUnauthorizedException(
        JwtStrategy.name,
        'Unauthorized',
        ApiResponseCode.UNAUTHORIZED,
      );
    }

    return { id, email };
  }
}
