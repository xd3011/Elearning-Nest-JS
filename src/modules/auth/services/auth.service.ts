import { RegisterUserDto } from '@modules/user/dto/create-user.dto';
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
import {
  ConfirmPasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '@modules/user/dto/forgot-passsword.dto';
import { generateCode } from '@shared/generate-code';
import { OtpService } from './otp.service';
import { EmailService } from '@modules/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private tokenService: TokenService,
    private readonly roleService: RoleService,
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
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

  createTemporaryToken = (payload: any) => {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<TAuthConfig>('auth').jwtResetKey,
      expiresIn: this.configService.get<TAuthConfig>('auth').resetExpireIn,
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

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userService.findOneByUsername(
      forgotPasswordDto.email,
    );
    const generatedOtp = generateCode(6);
    await this.otpService.createOtp(user, generatedOtp);
    await this.emailService.handleSendEmailForgotPassword(user, generatedOtp);
    return;
  }

  async verifyOtp(confirmPasswordDto: ConfirmPasswordDto, res: Response) {
    const otp = await this.otpService.findOtpByEmail(confirmPasswordDto.email);
    if (otp.otp !== confirmPasswordDto.code) {
      throw new CBadRequestException(
        AuthService.name,
        'Invalid OTP',
        ApiResponseCode.INVALID_OTP,
      );
    }
    if (otp.expiredOtp < new Date()) {
      await this.otpService.deleteOtp(otp.id);
      throw new CBadRequestException(
        AuthService.name,
        'OTP expired',
        ApiResponseCode.OTP_EXPIRED,
      );
    }
    await this.otpService.deleteOtp(otp.id);

    const payload = {
      sub: 'token reset password',
      iss: 'from server',
      id: otp.user.id,
      email: otp.user.email,
    };
    const temporaryToken = this.createTemporaryToken(payload);

    res.cookie('temporaryToken', temporaryToken, {
      httpOnly: true,
      maxAge: this.configService.get<TAuthConfig>('auth').resetExpireIn,
    });
    return;
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    req: Request,
    res: Response,
  ) {
    const temporaryToken = req.cookies.temporaryToken;
    if (!temporaryToken) {
      throw new CBadRequestException(
        AuthService.name,
        'Token reset password not found',
        ApiResponseCode.TOKEN_RESET_PASSWORD_NOT_FOUND,
      );
    }
    const authConfig = this.configService.get<TAuthConfig>('auth');
    const verify = await this.jwtService.verify(temporaryToken, {
      secret: authConfig.jwtResetKey,
    });
    await this.userService.resetPassword(
      verify.id,
      resetPasswordDto.newPassword,
    );
    res.clearCookie('temporaryToken');
    return;
  }
}
