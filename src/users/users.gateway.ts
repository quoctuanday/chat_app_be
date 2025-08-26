// user.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { gatewayConfig } from '../common/config/socket.config';
import { UsersService } from './users.service';

@WebSocketGateway(gatewayConfig)
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(UsersGateway.name);

  constructor(private readonly userService: UsersService) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) {
      this.logger.error(`No userId in handshake`);
      return;
    }
    await this.userService.updateUserStatus(userId, 'online');
    this.server.emit('statusChange', { userId, status: 'online' });
  }

  async handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) return;
    await this.userService.updateUserStatus(userId, 'offline');
    this.server.emit('statusChange', { userId, status: 'offline' });
  }
}
