import { CreateUserDto } from '@modules/user/dto/create-user.dto';
import { IUser } from '@modules/user/interface/user.interface';
import { UserService } from '@modules/user/user.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TAuthConfig } from '@src/config/auth.config';
import { Request, Response } from 'express';
import { CBadRequestException } from '@shared/custom-http-exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async register(createUserDto: CreateUserDto) {
    let newUser = await this.userService.register(createUserDto);
    return {
      id: newUser?.id,
      createdAt: newUser?.createdAt,
    };
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByUsername(username);
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
    const { id, email } = user;
    const payload = {
      sub: 'token login',
      iss: 'from server',
      id: id,
      email: email,
    };
    const refreshToken = this.createRefreshToken(payload);
    // await this.userService.updateUserToken(refreshToken, _id);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: this.configService.get<TAuthConfig>('auth').refreshTokenExpireIn,
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: { id, email },
    };
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        throw new CBadRequestException('Refresh token not found');
      }

      const verify = await this.jwtService.verify(refreshToken, {
        secret: this.configService.get<TAuthConfig>('auth').jwtRefreshKey,
      });

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
        maxAge:
          this.configService.get<TAuthConfig>('auth').refreshTokenExpireIn,
      });

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: verify.id,
          email: verify.email,
        },
      };
    } catch (error) {
      throw new CBadRequestException('Invalid refresh token');
    }
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
