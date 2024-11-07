import { Controller, Delete, Get, Post } from '@nestjs/common';

@Controller('chatMessage')
export class ChatMessageController {
  constructor() {}

  @Get('')
  getHello(): string {
    return 'Hello World!';
  }

  @Post('')
  createMessage(message: string) {
    console.log(`Received message: ${message}`);
    return `Message received: ${message}`;
  }

  //   @Get('/:id')
  //   getMessageById(@Param('id') id: string) {
  //     return `Message with id ${id} received`;
  //   }

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
