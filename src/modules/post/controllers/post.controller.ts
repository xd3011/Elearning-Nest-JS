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
import { PostService } from '../services/post.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { User } from '@src/decorator/user.decorator';
import { IUser } from '@modules/user/interface/user.interface';
import { PaginationParams } from '@src/utils/types/paginationParams';
import { ResponseMessage } from '@src/decorator/message.decorator';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto, @User() user: IUser) {
    return this.postService.create(createPostDto, user);
  }

  @Get()
  findAll(
    @Query() { offset, limit, startId }: PaginationParams,
    @Query('groupId') groupId: number,
    @User() user: IUser,
  ) {
    return this.postService.findAll(groupId, user, offset, limit, startId);
  }

  @Get(':id')
  @ResponseMessage('Get post successfully')
  findOne(@Param('id') id: number, @User() user: IUser) {
    return this.postService.findOne(id, user);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.postService.remove(id);
  }
}
