import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { CreateUserDto } from '@modules/user/dto/create-user.dto';
import { IUser } from '@modules/user/interface/user.interface';
import { User } from '@src/decorator/user.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Response } from 'express';
import { IsPublic } from '@src/decorator/is-public.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';
import { ResponseMessage } from '@src/decorator/message.decorator';
import { ApiTags } from '@nestjs/swagger';
import { ChangePasswordDto } from '@modules/user/dto/change-password.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @Post('/register')
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Register successfully')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('/login')
  @IsPublic()
  @UseGuards(LocalAuthGuard)
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Login successfully')
  async login(@Req() req, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(req.user, res);
  }

  @Get('/account')
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Get account successfully')
  async getAccount(@User() user: IUser) {
    return await this.authService.getAccount(user);
  }

  @Post('/changePassword')
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Change password successfully')
  async changePassword(
    @User() user: IUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(user, changePasswordDto);
  }

  @Get('/refreshToken')
  @IsPublic()
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Refresh token successfully')
  async refreshToken(@Req() req, @Res({ passthrough: true }) res: Response) {
    return this.authService.refreshToken(req, res);
  }

  @Post('/logout')
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Logout successfully')
  handleLogout(@Req() req, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req, res);
  }
}
