import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { TAuthConfig } from '@src/config/auth.config';
import { TConfigs } from '@src/config';

import { ApiResponseCode } from '@shared/constants/api-response-code.constant';
import { CUnauthorizedException } from '@shared/custom-http-exception';
import { IUser } from '@modules/user/interface/user.interface';
import { RoleService } from '@modules/role/role.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService<TConfigs>,
    private readonly roleService: RoleService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<TAuthConfig>('auth').jwtSecretKey,
    });
  }

  async validate(payload: IUser) {
    const { id, email, role } = payload;
    const roleDetail = await this.roleService.findOne(role);
    const permissions = roleDetail
      ? roleDetail.permission.map((per) => ({
          id: per.id,
          name: per.name,
          description: per.description,
          method: per.method,
          path: per.path,
        }))
      : [];
    if (!id) {
      throw new CUnauthorizedException(
        JwtStrategy.name,
        'Unauthorized',
        ApiResponseCode.UNAUTHORIZED,
      );
    }

    return { id, email, role, permissions };
  }
}
