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
import { ChatService } from '../services/chat.service';
import { CreateChatDto } from '../dto/create-chat.dto';
import { UpdateChatDto } from '../dto/update-chat.dto';
import { User } from '@src/decorator/user.decorator';
import { IUser } from '@modules/user/interface/user.interface';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';
import { ResponseMessage } from '@src/decorator/message.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('chat')
@ApiTags('Chat')
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Create chat successfully')
  create(@Body() createChatDto: CreateChatDto, @User() user: IUser) {
    return this.chatService.create(createChatDto, user);
  }

  @Get()
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Get all chats successfully')
  findAll(@User() user: IUser) {
    return this.chatService.findAll(user);
  }

  @Get(':id')
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Get chat successfully')
  findOne(@Param('id') id: number, @User() user: IUser) {
    return this.chatService.findOne(id, user);
  }

  @Patch(':id')
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Update chat successfully')
  update(
    @Param('id') id: number,
    @Body() updateChatDto: UpdateChatDto,
    @User() user: IUser,
  ) {
    return this.chatService.update(id, updateChatDto, user);
  }

  @Delete(':id')
  @UseInterceptors(TransformResponseInterceptor)
  @ResponseMessage('Delete chat successfully')
  remove(@Param('id') id: number) {
    return this.chatService.remove(id);
  }
}
