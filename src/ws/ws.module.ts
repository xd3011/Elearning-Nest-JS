import { Module } from '@nestjs/common';
import { WsGateway } from './ws.gateway';
import { AuthModule } from '@modules/auth/auth.module';
import { WSService } from './ws.service';
import { ChatModule } from '@modules/chat/chat.module';
import { PostModule } from '@modules/post/post.module';

@Module({
  imports: [AuthModule, ChatModule, PostModule],
  controllers: [],
  providers: [WsGateway, WSService],
})
export class WSModule {}
