import { JwtAuthWsGuard } from '@modules/auth/guards/jwt-auth-ws.guard';
import { AuthService } from '@modules/auth/services/auth.service';
import { IUser } from '@modules/user/interface/user.interface';
import { Injectable, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { User } from '@src/decorator/user.decorator';
import { Server, Socket } from 'socket.io';
import { WSService } from './ws.service';
import { CreateChatMessageDto } from '@modules/chat/dto/create-chat-message.dto';
import { ChatMessageService } from '@modules/chat/services/chatMessage.service';
import { ChatService } from '@modules/chat/services/chat.service';

export interface CustomSocket extends Socket {
  user: IUser;
}
@WebSocketGateway({ cors: true })
@Injectable()
export class WsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly wsService: WSService,
    private readonly chatService: ChatService,
    private readonly chatMessageService: ChatMessageService,
  ) {}

  // @UseGuards(JwtAuthWsGuard)
  // handleConnection(client: Socket, @User() user: IUser) {
  //   console.log(`Client connected: ${client.id}, User: ${user}`);
  // }

  // @UseGuards(JwtAuthWsGuard)
  // handleDisconnect(client: Socket, @User() user: IUser) {
  //   console.log(`Client disconnected: ${client.id}, User: ${user}`);
  // }

  @UseGuards(JwtAuthWsGuard)
  async handleConnection(client: Socket) {
    const authToken: any = client.handshake?.headers.access_token;
    const payload = await this.authService.verifyToken(authToken);
    const { id }: IUser = payload;
    await this.wsService.cacheClientId(client.id, id);
  }

  @UseGuards(JwtAuthWsGuard)
  async handleDisconnect(client: Socket, @User() user: IUser) {
    const authToken: any = client.handshake?.headers.access_token;
    const payload = await this.authService.verifyToken(authToken);
    const { id }: IUser = payload;
    await this.wsService.removeClientId(client.id, id);
  }

  @SubscribeMessage('/chat')
  @UseGuards(JwtAuthWsGuard)
  async handleMessage(
    @MessageBody() chatMessageDto: CreateChatMessageDto,
    @ConnectedSocket() socket: Socket,
    @User() user: IUser,
  ) {
    const chatMessage = await this.chatMessageService.create(
      chatMessageDto,
      user,
    );
    const getUserMessageId = await this.chatService.getUserMessage(
      chatMessage.chat.id,
      user,
    );
    const getClientIds = await this.wsService.getClientIds(getUserMessageId);
    console.log(getClientIds);

    // this.server.emit('newMessage', chatMessageDto);
    if (getClientIds.clientIds.length > 0) {
      getClientIds.clientIds.forEach((clientId) => {
        this.server.to(clientId).emit('/chat/message', chatMessage);
      });
    }
  }
}
