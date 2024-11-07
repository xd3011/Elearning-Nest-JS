import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { CreateChatDto } from '../dto/create-chat.dto';
import { UpdateChatDto } from '../dto/update-chat.dto';
import { User } from '@src/decorator/user.decorator';
import { IUser } from '@modules/user/interface/user.interface';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  create(@Body() createChatDto: CreateChatDto, @User() user: IUser) {
    return this.chatService.create(createChatDto, user);
  }

  @Get()
  findAll(@User() user: IUser) {
    return this.chatService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @User() user: IUser) {
    return this.chatService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateChatDto: UpdateChatDto,
    @User() user: IUser,
  ) {
    return this.chatService.update(id, updateChatDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.chatService.remove(id);
  }
}
