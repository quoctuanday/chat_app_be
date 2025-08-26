import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { gatewayConfig } from '../common/config/socket.config';
import { ChatService } from './chat.service';
import { UpdateMessageDto } from './dto/update-message.dto';

@WebSocketGateway(gatewayConfig)
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: {
      senderId: string;
      dto: any;
    },
  ) {
    const message = await this.chatService.createMessage(
      data.senderId,
      data.dto,
    );
    this.server.to(data.dto.conversation_id).emit('newMessage', message);
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
  async handleDeleteMessage(
    @MessageBody()
    data: {
      messageId: string;
    },
  ) {
    const deletedMessage = await this.chatService.deleteMessage(data.messageId);
    this.server
      .to(deletedMessage.conversation_id)
      .emit('messageDeleted', deletedMessage);
  }
}
