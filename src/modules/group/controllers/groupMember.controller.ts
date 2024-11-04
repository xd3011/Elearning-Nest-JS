import { IUser } from '@modules/user/interface/user.interface';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ResponseMessage } from '@src/decorator/message.decorator';
import { User } from '@src/decorator/user.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';
import { PaginationParams } from '@src/utils/types/paginationParams';
import { GroupMemberService } from '../services/groupMember.service';
import { AddMemberDto } from '../dto/create-member-group.dto';

@Controller('group-member')
export class GroupMemberController {
  constructor(private readonly groupMemberService: GroupMemberService) {}
  @Get()
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('')
  findAll(
    @Query() { offset, limit, startId }: PaginationParams,
    @Query('groupId') groupId: number,
    @User() user: IUser,
  ) {
    return this.groupMemberService.findAll(groupId, offset, limit, startId);
  }

  @Post()
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Add member successfully')
  addMember(@Body() addMemberDto: AddMemberDto, @User() user: IUser) {
    return this.groupMemberService.addMember(addMemberDto, user);
  }
}
