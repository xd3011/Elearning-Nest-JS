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
import { PostService } from '../services/post.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { User } from '@src/decorator/user.decorator';
import { IUser } from '@modules/user/interface/user.interface';
import { PaginationParams } from '@src/utils/types/paginationParams';
import { ResponseMessage } from '@src/decorator/message.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Create post successfully')
  create(@Body() createPostDto: CreatePostDto, @User() user: IUser) {
    return this.postService.create(createPostDto, user);
  }

  @Get()
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Get all posts successfully')
  findAll(
    @Query() { offset, limit, startId }: PaginationParams,
    @Query('groupId') groupId: number,
    @User() user: IUser,
  ) {
    return this.postService.findAll(groupId, user, offset, limit, startId);
  }

  @Get('allMetting')
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Get all metting successfully')
  findAllMetting(@User() user: IUser) {
    return this.postService.getAllMettingForUser(user);
  }

  @Get(':id')
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Get post successfully')
  findOne(@Param('id') id: number, @User() user: IUser) {
    return this.postService.findOne(id, user);
  }

  @Patch(':id')
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Update post successfully')
  update(@Param('id') id: number, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Delete post successfully')
  remove(@Param('id') id: number) {
    return this.postService.remove(id);
  }
}
