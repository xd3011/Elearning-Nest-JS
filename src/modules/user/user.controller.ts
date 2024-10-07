import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UserCreateResult } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationParams } from '@src/utils/types/paginationParams';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserCreateResult> {
    return await this.userService.create(createUserDto, 3);
  }

  @Get()
  findAll(@Query() { offset, limit, startId }: PaginationParams) {
    return this.userService.findAllUser(offset, limit, startId);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.userService.findUserById(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(id, updateUserDto, 3);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.userService.removeUser(id, 3);
  }
}
