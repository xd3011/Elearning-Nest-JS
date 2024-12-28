import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { User } from '@src/decorator/user.decorator';
import { IUser } from '@modules/user/interface/user.interface';
import { ResponseMessage } from '@src/decorator/message.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('permission')
@ApiTags('Permission')
@ApiBearerAuth()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Create permission successfully')
  create(
    @Body() createPermissionDto: CreatePermissionDto,
    @User() user: IUser,
  ) {
    return this.permissionService.create(createPermissionDto, user);
  }

  @Get()
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Get all permissions successfully')
  findAll() {
    return this.permissionService.findAll();
  }

  @Get(':id')
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Get permission successfully')
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Update permission successfully')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.update(+id, updatePermissionDto);
  }

  @Delete(':id')
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Delete permission successfully')
  remove(@Param('id') id: string) {
    return this.permissionService.remove(+id);
  }
}
