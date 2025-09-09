import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { gatewayConfig } from '../common/config/socket.config';
import { ChatService } from './chat.service';
import { UsersService } from '../users/users.service';
import { UpdateMessageDto } from './dto/update-message.dto';

@WebSocketGateway(gatewayConfig)
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private userSockets = new Map<string, string>();

  constructor(
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
  ) {}

  //  Socket connection
  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userSockets.set(userId, client.id);
      this.logger.log(`User ${userId} connected with socket ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = [...this.userSockets.entries()].find(
      ([, socketId]) => socketId === client.id,
    )?.[0];

    if (userId) {
      this.userSockets.delete(userId);
      this.logger.log(`User ${userId} disconnected`);
    }
  }

  //  Chat messages
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: {
      senderId: string;
      conversation_id: string;
      content?: string;
      reply_to_id?: string;
      message_type?: 'text' | 'image' | 'file' | 'system';
    },
  ) {
    const message = await this.chatService.createMessage(data.senderId, {
      conversation_id: data.conversation_id,
      content: data.content,
      reply_to_id: data.reply_to_id,
      message_type: data.message_type,
    });

    const fullMessage = await this.chatService.getMessageById(
      message.message_id,
    );

    this.server.to(data.conversation_id).emit('newMessage', fullMessage);
  }

  @SubscribeMessage('updateMessage')
  async handleUpdateMessage(
    @MessageBody()
    data: {
      messageId: string;
      dto: UpdateMessageDto;
    },
  ) {
    const updatedMessage = await this.chatService.updateMessage(
      data.messageId,
      data.dto,
    );
    this.server
      .to(updatedMessage.conversation_id)
      .emit('messageUpdated', updatedMessage);
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(@MessageBody() data: { messageId: string }) {
    const deletedMessage = await this.chatService.deleteMessage(data.messageId);
    this.server
      .to(deletedMessage.conversation_id)
      .emit('messageDeleted', deletedMessage);
  }

  //  Call events
  @SubscribeMessage('callUser')
  async handleCallUser(
    @MessageBody() data: { to: string; from: string; conversationId: string },
  ) {
    this.logger.log(`User ${data.from} is calling ${data.to}`);
    const targetSocketId = this.userSockets.get(data.to);
    if (targetSocketId) {
      const caller = await this.usersService.findUser({ user_id: data.from });
      this.server.to(targetSocketId).emit('incomingCall', {
        from: data.from,
        conversationId: data.conversationId,
        username: caller.username,
        avatarUrl: caller.avatar_url,
      });
    }
  }

  @SubscribeMessage('acceptCall')
  handleAcceptCall(@MessageBody() data: { to: string; from: string }) {
    this.logger.log(`User ${data.from} accepted call from ${data.to}`);
    const targetSocketId = this.userSockets.get(data.to);
    if (targetSocketId) {
      this.server.to(targetSocketId).emit('callAccepted', { from: data.from });
    }
  }

  @SubscribeMessage('rejectCall')
  handleRejectCall(@MessageBody() data: { to: string; from: string }) {
    this.logger.log(`User ${data.from} rejected call from ${data.to}`);
    const targetSocketId = this.userSockets.get(data.to);
    if (targetSocketId) {
      this.server.to(targetSocketId).emit('callRejected', { from: data.from });
    }
  }

  //  WebRTC signaling
  @SubscribeMessage('offer')
  handleOffer(@MessageBody() data: { to: string; from: string; sdp: any }) {
    const targetSocketId = this.userSockets.get(data.to);
    if (targetSocketId) {
      this.server
        .to(targetSocketId)
        .emit('offer', { from: data.from, sdp: data.sdp });
    }
  }

  @SubscribeMessage('answer')
  handleAnswer(@MessageBody() data: { to: string; from: string; sdp: any }) {
    const targetSocketId = this.userSockets.get(data.to);
    if (targetSocketId) {
      this.server
        .to(targetSocketId)
        .emit('answer', { from: data.from, sdp: data.sdp });
    }
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @MessageBody() data: { to: string; from: string; candidate: any },
  ) {
    const targetSocketId = this.userSockets.get(data.to);
    if (targetSocketId) {
      this.server.to(targetSocketId).emit('ice-candidate', {
        from: data.from,
        candidate: data.candidate,
      });
    }
  }
}
