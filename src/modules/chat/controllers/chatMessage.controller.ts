import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ChatMessageService } from '../services/chatMessage.service';
import { IUser } from '@modules/user/interface/user.interface';
import { User } from '@src/decorator/user.decorator';
import { CreateChatMessageDto } from '../dto/create-chat-message.dto';
import { PaginationParams } from '@src/utils/types/paginationParams';
import { UpdateChatMessageDto } from '../dto/update-chat-message.dto';

@Controller('chatMessage')
export class ChatMessageController {
  constructor(private readonly chatMessageService: ChatMessageService) {}

  @Post('')
  async createMessage(
    @Body() chatMessageDto: CreateChatMessageDto,
    @User() user: IUser,
  ) {
    return await this.chatMessageService.create(chatMessageDto, user);
  }

  @Get('getAll/:chatId')
  async findAll(
    @Query() { offset, limit, startId }: PaginationParams,
    @Param('chatId') chatId: number,
    @User() user: IUser,
  ) {
    return await this.chatMessageService.findAll(
      chatId,
      user,
      offset,
      limit,
      startId,
    );
  }

  @Get('/:id')
  async getMessageById(@Param('id') id: number, @User() user: IUser) {
    return await this.chatMessageService.findOne(id, user);
  }

  @Patch('/:id')
  async updateMessage(
    @Param('id') id: number,
    @Body() updateChatMessageDto: UpdateChatMessageDto,
    @User() user: IUser,
  ) {
    return await this.chatMessageService.updateMessage(
      id,
      updateChatMessageDto,
      user,
    );
  }
  @Delete('/:id')
  async deleteMessage(@Param('id') id: number, @User() user: IUser) {
    return await this.chatMessageService.deleteMessage(id, user);
  }

  //   @Get('/user/:userId')
  //   getMessagesByUser(@Param('userId') userId: string) {
  //     return `Messages for user ${userId} received`;
  //   }

  //   @Post('chatMessage/user/:userId')
  //   sendMessageToUser(@Param('userId') userId: string, message: string) {
  //     console.log(`Sending message to user ${userId}: ${message}`);
  //     return `Message sent to user ${userId}: ${message}`;
  //   }

  //   @Delete('chatMessage/:id')
  //   deleteMessage(@Param('id') id: string) {
  //     return `Message with id ${id} deleted`;
  //   }

  //   @Put('chatMessage/:id')
  //   updateMessage(@Param('id') id: string, message: string) {
  //     console.log(`Updating message with id ${id}: ${message}`);
  //     return `Message updated with id ${id}: ${message}`;
  //   }

  //   @Patch('chatMessage/:id')
  //   markMessageAsRead(@Param('id') id: string) {
  //     console.log(`Marking message with id ${id} as read`);
  //     return `Message with id ${id} marked as read`;
  //   }

  //   @Get('chatMessage/last/:count')
  //   getLastMessages(@Param('count') count: number) {
  //     return `Last ${count} messages received`;
  //   }
}
