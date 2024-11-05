import { Module } from '@nestjs/common';
import { WsGateway } from './ws.gateway';
import { AuthModule } from '@modules/auth/auth.module';
import { WSService } from './ws.service';

@Module({
  imports: [AuthModule],
  controllers: [],
  providers: [WsGateway, WSService],
})
export class WSModule {}
