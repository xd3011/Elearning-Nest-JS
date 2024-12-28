import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { SubPostService } from '../services/subPost.service';
import { User } from '@src/decorator/user.decorator';
import { IUser } from '@modules/user/interface/user.interface';
import { CreateSubPostDto } from '../dto/create-sub-post.dto';
import { PaginationParams } from '@src/utils/types/paginationParams';
import { UpdateSubPostDto } from '../dto/update-sub-post.dto';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';
import { ResponseMessage } from '@src/decorator/message.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('sub-post')
@ApiTags('Sub Post')
@ApiBearerAuth()
export class SubPostController {
  constructor(private readonly subPostService: SubPostService) {}

  @Post()
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Create sub post successfully')
  create(@Body() createSubPostDto: CreateSubPostDto, @User() user: IUser) {
    return this.subPostService.create(createSubPostDto, user);
  }

  @Get()
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Get all sub posts successfully')
  findAll(
    @Query() { offset, limit, startId }: PaginationParams,
    @Query('postId') postId: number,
    @User() user: IUser,
  ) {
    return this.subPostService.findAll(postId, user, offset, limit, startId);
  }

  @Get('/:id')
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Get sub post successfully')
  findOne(@Param('id') id: number, @User() user: IUser) {
    return this.subPostService.findOne(id, user);
  }

  @Patch('/:id')
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Update sub post successfully')
  update(
    @Param('id') id: number,
    @Body() updateSubPostDto: UpdateSubPostDto,
    @User() user: IUser,
  ) {
    return this.subPostService.update(id, updateSubPostDto, user);
  }

  @Delete('/:id')
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Delete sub post successfully')
  remove(@Param('id') id: number, @User() user: IUser) {
    return this.subPostService.remove(id, user);
  }
}
