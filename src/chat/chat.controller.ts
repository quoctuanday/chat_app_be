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
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Controller('api/message')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('')
  async createMessage(@Req() req, @Body() dto: CreateMessageDto) {
    const senderId = req.user.userId;
    return this.chatService.createMessage(senderId, dto);
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
