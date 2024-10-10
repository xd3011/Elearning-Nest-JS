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
import { AuthService } from './auth.service';
import { CreateUserDto } from '@modules/user/dto/create-user.dto';
import { IUser } from '@modules/user/interface/user.interface';
import { User } from '@src/decorator/user.decorator';
import { LocalAuthGuard } from './localAuth.guard';
import { Response } from 'express';
import { IsPublic } from '@src/decorator/is-public.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';
import { ResponseMessage } from '@src/decorator/message.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @Post('/register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('/login')
  @IsPublic()
  @UseGuards(LocalAuthGuard)
  @UseInterceptors(TransformResponseInterceptor)
  async login(@Req() req, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(req.user, res);
  }

  @Get('/account')
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Get account successfully')
  async getAccount(@User() user: IUser) {
    return await this.authService.getAccount(user);
  }

  @IsPublic()
  @Get('/refreshToken')
  @UseInterceptors(TransformResponseInterceptor)
  async refreshToken(@Req() req, @Res({ passthrough: true }) res: Response) {
    return this.authService.refreshToken(req, res);
  }

  @Post('/logout')
  @UseInterceptors(TransformResponseInterceptor)
  handleLogout(@Res({ passthrough: true }) res: Response, @User() user: IUser) {
    return this.authService.logout(res, user);
  }
}
