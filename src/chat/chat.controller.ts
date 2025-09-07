// chat.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Req,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Controller('api/message')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post('')
  async createMessage(@Req() req, @Body() dto: CreateMessageDto) {
    console.log(dto);
    const senderId = req.user.userId;
    const message = await this.chatService.createMessage(senderId, dto);

    const fullMessage = await this.chatService.getMessageById(
      message.message_id,
    );
    this.chatGateway.server
      .to(dto.conversation_id)
      .emit('newMessage', fullMessage);

    return fullMessage;
  }

  @Get(':conversationId')
  async getMessages(@Param('conversationId') conversationId: string) {
    return this.chatService.getMessages(conversationId);
  }

  @Put(':id')
  async updateMessage(
    @Param('id') messageId: string,
    @Body() dto: UpdateMessageDto,
  ) {
    return this.chatService.updateMessage(messageId, dto);
  }

  @Delete(':id')
  async deleteMessage(@Param('id') messageId: string) {
    return this.chatService.deleteMessage(messageId);
  }
}
