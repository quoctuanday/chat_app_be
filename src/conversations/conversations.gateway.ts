import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { gatewayConfig } from '../common/config/socket.config';
import { ChatService } from '../chat/chat.service';

@WebSocketGateway(gatewayConfig)
export class ConversationsGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ConversationsGateway.name);

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.conversationId);

    await this.chatService.markAllAsRead(data.conversationId, data.userId);

    this.logger.log(
      `Socket ${client.id} joined conversation ${data.conversationId} and marked as read`,
    );
  }

  @SubscribeMessage('leaveConversation')
  async handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.conversationId);
    this.logger.log(
      `Socket ${client.id} left conversation ${data.conversationId}`,
    );
  }
}
