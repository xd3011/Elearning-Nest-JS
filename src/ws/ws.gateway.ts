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

export interface CustomSocket extends Socket {
  user: IUser;
}
@WebSocketGateway()
@Injectable()
export class WsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly wsService: WSService,
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
  handleMessage(
    @MessageBody() input: string,
    @ConnectedSocket() socket: Socket,
    @User() user: IUser,
  ): void {
    console.log(input, socket.id, user);
  }
}
