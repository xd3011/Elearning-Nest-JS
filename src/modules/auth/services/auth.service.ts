import {
  CreateUserDto,
  RegisterUserDto,
} from '@modules/user/dto/create-user.dto';
import { IUser } from '@modules/user/interface/user.interface';
import { UserService } from '@modules/user/user.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TAuthConfig } from '@src/config/auth.config';
import { Request, Response } from 'express';
import { CBadRequestException } from '@shared/custom-http-exception';
import { TokenService } from './token.service';
import { ApiResponseCode } from '@shared/constants/api-response-code.constant';
import { RoleService } from '@modules/role/role.service';
import { Role } from '@modules/role/entities/role.entity';
import { CLogger } from '@src/logger/custom-loger';
import { ChangePasswordDto } from '@modules/user/dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private tokenService: TokenService,
    private readonly roleService: RoleService,
  ) {}
  async register(registerUserDto: RegisterUserDto) {
    let newUser = await this.userService.register(registerUserDto);
    return {
      id: newUser?.id,
      createdAt: newUser?.createdAt,
    };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByUsername(email);
    if (user) {
      const isValid = this.userService.isValidPassword(pass, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }
    return null;
  }

  createRefreshToken = (payload: any) => {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<TAuthConfig>('auth').jwtRefreshKey,
      expiresIn:
        this.configService.get<TAuthConfig>('auth').refreshTokenExpireIn,
    });
  };

  async login(user: IUser, res: Response) {
    const { id, email, role } = user;
    const roleDetail = await this.roleService.findOne(
      (role as unknown as Role).id,
    );
    const payload = {
      sub: 'token login',
      iss: 'from server',
      id: id,
      email: email,
      role: roleDetail.id,
    };
    const refreshToken = this.createRefreshToken(payload);
    await this.tokenService.saveToken(refreshToken, id);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: this.configService.get<TAuthConfig>('auth').refreshTokenExpireIn,
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: { id, email },
    };
  }

  async verifyToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('auth').jwtSecret,
      });
      return payload;
    } catch (error) {
      CLogger.log(`Token verification failed: ${error.message}`);
      return null;
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        throw new CBadRequestException(
          AuthService.name,
          'Refresh token not found',
          ApiResponseCode.REFRESH_TOKEN_NOT_FOUND,
        );
      }

      const authConfig = this.configService.get<TAuthConfig>('auth');
      const verify = await this.jwtService.verify(refreshToken, {
        secret: authConfig.jwtRefreshKey,
      });

      const token = await this.tokenService.findToken(refreshToken);
      if (!token) {
        throw new CBadRequestException(
          AuthService.name,
          'Invalid refresh token',
          ApiResponseCode.INVALID_TOKEN,
        );
      }

      const payload = {
        sub: 'token refresh',
        iss: 'from server',
        id: verify.id,
        email: verify.email,
      };

      const newRefreshToken = this.createRefreshToken(payload);

      res.clearCookie('refreshToken');
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        maxAge: authConfig.refreshTokenExpireIn,
      });

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: verify.id,
          email: verify.email,
        },
      };
    } catch (error) {
      if (error instanceof CBadRequestException) {
        throw error;
      }
      throw new CBadRequestException('Invalid refresh token');
    }
  }

  async getAccount(user: IUser) {
    return await this.userService.findUserById(user.id);
  }

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;
    await this.tokenService.deleteToken(refreshToken);
    res.clearCookie('refreshToken');
    return;
  }

  async changePassword(user: IUser, changePasswordDto: ChangePasswordDto) {
    return await this.userService.changePassword(user, changePasswordDto);
  }
}
