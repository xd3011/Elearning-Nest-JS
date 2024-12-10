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
import { PostService } from '@modules/post/services/post.service';
import { CreateSubPostDto } from '@modules/post/dto/create-sub-post.dto';
import { SubPostService } from '@modules/post/services/subPost.service';

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
    private readonly subPostService: SubPostService,
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

  @SubscribeMessage('/sub-post')
  async handleSubPostMessage(
    @MessageBody() subPostDto: CreateSubPostDto,
    @User() user: IUser,
  ) {
    const subPost = await this.subPostService.create(subPostDto, user);
    const post = await this.postService.findOne(subPostDto.postId, user);
    this.server.to(`/group/${post.group.id}`).emit(`/group/sub-post`, subPost);
  }

  @SubscribeMessage('/calling')
  async handleCalling(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() payload: CreateChatMessageDto,
    @User() user: IUser,
  ) {
    const chatMessage = await this.chatMessageService.create(payload, user);
    const getUserByChat = await this.chatService.getUserMessage(
      payload.chatId,
      user,
    );
    const getClientIds = await this.wsService.getClientIds(getUserByChat);
    this.server.to(client.id).emit('/calling-receiver', {
      chatId: payload.chatId,
      chatMessage: chatMessage,
    });
    if (getClientIds.clientIds.length > 0) {
      getClientIds.clientIds.forEach((clientId) => {
        this.server.to(clientId).emit('/calling-send', {
          chatId: payload.chatId,
          chatMessage: chatMessage,
        });
      });
    }
  }

  @SubscribeMessage('/calling-accept')
  async handleCallingAccept(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() payload: { chatId: number },
    @User() user: IUser,
  ) {
    await this.handleCallingResponse(client, payload, user, true);
  }

  @SubscribeMessage('/calling-reject')
  async handleCallingReject(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() payload: { chatId: number },
    @User() user: IUser,
  ) {
    await this.handleCallingResponse(client, payload, user, false);
  }

  @SubscribeMessage('/calling/offer')
  async handleOffer(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() payload: { offer: any; chatId: number },
    @User() user: IUser,
  ) {
    await this.handleWebSocketEvent(
      client,
      payload,
      user,
      'offer',
      '/calling/offer',
    );
  }

  @SubscribeMessage('/calling/answer')
  async handleAnswer(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() payload: { answer: any; chatId: number },
    @User() user: IUser,
  ) {
    await this.handleWebSocketEvent(
      client,
      payload,
      user,
      'answer',
      '/calling/answer',
    );
  }

  @SubscribeMessage('/calling/ice-candidate')
  async handleIceCandidate(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() payload: { candidate: any; chatId: number },
    @User() user: IUser,
  ) {
    await this.handleWebSocketEvent(
      client,
      payload,
      user,
      'candidate',
      '/calling/ice-candidate',
    );
  }

  private async handleWebSocketEvent(
    client: CustomSocket,
    payload: { [key: string]: any; chatId: number },
    user: IUser,
    dataReceive: string,
    eventType: string,
  ) {
    const { chatId } = payload;
    if (!chatId || !payload[dataReceive]) {
      return this.server
        .to(client.id)
        .emit('error', `Invalid ${dataReceive} or chatId`);
    }

    const getUserByChat = await this.chatService.getUserMessage(chatId, user);
    const getClientIds = await this.wsService.getClientIds(getUserByChat);

    if (getClientIds.clientIds.length > 0) {
      getClientIds.clientIds.forEach((clientId) => {
        this.server
          .to(clientId)
          .emit(eventType, { [eventType]: payload[eventType], chatId });
      });
    }
  }

  private async handleCallingResponse(
    client: CustomSocket,
    payload: { chatId: number },
    user: IUser,
    success: boolean,
  ) {
    const { chatId } = payload;
    if (!chatId) {
      return this.server.to(client.id).emit('error', 'Invalid chatId');
    }

    const getUserByChat = await this.chatService.getUserMessage(chatId, user);
    const getClientIds = await this.wsService.getClientIds(getUserByChat);

    if (getClientIds.clientIds.length > 0) {
      getClientIds.clientIds.forEach((clientId) => {
        this.server.to(clientId).emit('/calling-return', {
          chatId,
          success,
        });
      });
    }
  }
}
