import { Module } from '@nestjs/common';
import { ChatService } from './services/chat.service';
import { ChatController } from './controllers/chat.controller';
import { UserModule } from '@modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { ChatMember } from './entities/chatMember.entity';
import { ChatMessageController } from './controllers/chatMessage.controller';
import { ChatMessageService } from './services/chatMessage.service';
import { ChatMessage } from './entities/chatMessage.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, ChatMember, ChatMessage]),
    UserModule,
  ],
  controllers: [ChatController, ChatMessageController],
  providers: [ChatService, ChatMessageService],
})
export class ChatModule {}
