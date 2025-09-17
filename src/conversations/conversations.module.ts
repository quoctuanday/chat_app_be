import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { ConversationsGateway } from './conversations.gateway';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [ChatModule],
  controllers: [ConversationsController],
  providers: [ConversationsService, PrismaService, ConversationsGateway],
  exports: [ConversationsService],
})
export class ConversationsModule {}
