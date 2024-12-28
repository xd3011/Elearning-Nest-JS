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
import { GroupService } from '../services/group.service';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { IUser } from '@modules/user/interface/user.interface';
import { User } from '@src/decorator/user.decorator';
import { PaginationParams } from '@src/utils/types/paginationParams';
import { ResponseMessage } from '@src/decorator/message.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('group')
@ApiTags('Group')
@ApiBearerAuth()
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Create group successfully')
  create(@Body() createTeamDto: CreateGroupDto, @User() user: IUser) {
    return this.groupService.create(createTeamDto, user);
  }

  @Get()
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Get all groups successfully')
  findAll(
    @Query() { offset, limit, startId }: PaginationParams,
    @User() user: IUser,
  ) {
    return this.groupService.findAll(user, offset, limit, startId);
  }

  @Get(':id')
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Get group successfully')
  findOne(@Param('id') id: number, @User() user: IUser) {
    return this.groupService.findOne(id, user);
  }

  @Patch(':id')
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Update group successfully')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupService.update(+id, updateGroupDto);
  }

  @Delete(':id')
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Delete group successfully')
  remove(@Param('id') id: number, @User() user: IUser) {
    return this.groupService.remove(id, user);
  }
}
