import { Module } from '@nestjs/common';
import { ChatService } from './services/chat.service';
import { ChatController } from './controllers/chat.controller';
import { UserModule } from '@modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { ChatMember } from './entities/chatMember.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, ChatMember]), UserModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
