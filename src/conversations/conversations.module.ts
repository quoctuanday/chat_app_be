import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { ConversationsGateway } from './conversations.gateway';

@Module({
  controllers: [ConversationsController],
  providers: [ConversationsService, PrismaService, ConversationsGateway],
  exports: [ConversationsService],
})
export class ConversationsModule {}
