import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, CreateUserResult } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationParams } from '@src/utils/types/paginationParams';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';
import { ResponseMessage } from '@src/decorator/message.decorator';
import { User } from '@src/decorator/user.decorator';
import { IUser } from './interface/user.interface';
import { ApiTags } from '@nestjs/swagger';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Create user successfully')
  async create(
    @Body() createUserDto: CreateUserDto,
    @User() user: IUser,
  ): Promise<CreateUserResult> {
    return await this.userService.create(createUserDto, user.id);
  }

  @Get()
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Get all users successfully')
  findAll(@Query() { offset, limit, startId }: PaginationParams) {
    return this.userService.findAllUser(offset, limit, startId);
  }

  @Get(':id')
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Get user successfully')
  findOne(@Param('id') id: number) {
    return this.userService.findUserById(id);
  }

  @Patch(':id')
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Update user successfully')
  update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: IUser,
  ) {
    return this.userService.updateUser(id, updateUserDto, user.id);
  }

  @Delete(':id')
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Remove user successfully')
  async remove(@Param('id') id: number, @User() user: IUser) {
    return await this.userService.removeUser(id, user.id);
  }
}
