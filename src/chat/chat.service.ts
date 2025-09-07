// chat.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createMessage(senderId: string, dto: CreateMessageDto) {
    const { conversation_id, content, reply_to_id, message_type } = dto;

    const conversation = await this.prisma.conversation.findUnique({
      where: { conversation_id },
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const message = await this.prisma.message.create({
      data: {
        conversation_id,
        sender_id: senderId,
        content,
        reply_to_id,
        message_type: message_type ?? 'text',
      },
      include: {
        sender: true,
        attachments: true,
        reply_to: true,
        statuses: true,
      },
    });

    this.logger.log(`Message created: ${message.message_id} by ${senderId}`);
    return message;
  }

  async getMessages(conversationId: string) {
    return this.prisma.message.findMany({
      where: { conversation_id: conversationId },
      orderBy: { created_at: 'asc' },
      include: {
        sender: true,
        attachments: true,
        reply_to: true,
        statuses: true,
      },
    });
  }

  async getMessageById(messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { message_id: messageId },
      include: {
        sender: true,
        attachments: true,
        reply_to: true,
        statuses: true,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }

  async updateMessage(messageId: string, dto: UpdateMessageDto) {
    const message = await this.prisma.message.findUnique({
      where: { message_id: messageId },
    });
    if (!message) throw new NotFoundException('Message not found');

    return this.prisma.message.update({
      where: { message_id: messageId },
      data: {
        content: dto.content,
        is_deleted: dto.is_deleted,
        reactions: dto.reactions,
      },
      include: {
        sender: true,
        attachments: true,
        reply_to: true,
        statuses: true,
      },
    });
  }

  async deleteMessage(messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { message_id: messageId },
    });
    if (!message) throw new NotFoundException('Message not found');

    return this.prisma.message.update({
      where: { message_id: messageId },
      data: { is_deleted: true },
    });
  }
}
