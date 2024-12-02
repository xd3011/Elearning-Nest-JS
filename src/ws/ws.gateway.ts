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
import { CreatePostDto } from '@modules/post/dto/create-post.dto';
import { PostService } from '@modules/post/post.service';

export interface CustomSocket extends Socket {
  user: IUser;
}
@WebSocketGateway({ cors: true })
@Injectable()
@UseGuards(JwtAuthWsGuard)
export class WsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly wsService: WSService,
    private readonly chatService: ChatService,
    private readonly chatMessageService: ChatMessageService,
    private readonly postService: PostService,
  ) {}

  async handleConnection(client: Socket) {
    const authToken: any = client.handshake?.headers.access_token;
    if (!authToken) {
      return this.server.to(client.id).emit('error', 'Unauthorized');
    }
    const payload = await this.authService.verifyToken(authToken);
    const { id }: IUser = payload;
    await this.wsService.cacheClientId(client.id, id);
  }

  async handleDisconnect(client: Socket) {
    const authToken: any = client.handshake?.headers.access_token;
    if (!authToken) {
      return this.server.to(client.id).emit('error', 'Unauthorized');
    }
    const payload = await this.authService.verifyToken(authToken);
    const { id }: IUser = payload;
    await this.wsService.removeClientId(client.id, id);
  }

  @SubscribeMessage('/chat')
  async handleMessage(
    @MessageBody() chatMessageDto: CreateChatMessageDto,
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
    if (getClientIds.clientIds.length > 0) {
      getClientIds.clientIds.forEach((clientId) => {
        this.server.to(clientId).emit('/chat/message', chatMessage);
      });
    }
  }

  @SubscribeMessage('/group/join-group')
  async handleJoinGroupMessage(
    @MessageBody('groupId') groupId: number,
    @ConnectedSocket() socket: Socket,
  ) {
    this.server.in(socket.id).socketsJoin(`/group/${groupId}`);
  }

  @SubscribeMessage('/post')
  async handlePostMessage(
    @MessageBody() postDto: CreatePostDto,
    @User() user: IUser,
  ) {
    const post = await this.postService.create(postDto, user);
    this.server.to(`/group/${postDto.groupId}`).emit(`/group/post`, post);
  }
}
