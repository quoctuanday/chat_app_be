import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { RemoveMemberDto } from './dto/remove-member.dto';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { MemberRole } from '../../generated/prisma';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  // Tạo conversation mới
  async create(
    userId: string,
    dto: CreateConversationDto,
  ): Promise<ConversationResponseDto> {
    if (dto.type === 'private') {
      if (!dto.memberIds || dto.memberIds.length !== 1) {
        throw new Error('Private conversation must have exactly 2 members.');
      }

      // Nếu private thì cả 2 đều là member
      const conversation = await this.prisma.conversation.create({
        data: {
          type: 'private',
          members: {
            create: [
              { user_id: userId, role: 'member' },
              { user_id: dto.memberIds[0], role: 'member' },
            ],
          },
        },
        include: { members: { include: { user: true } } },
      });

      return this.toConversationResponse(conversation);
    }

    if (dto.type === 'group') {
      if (!dto.memberIds || dto.memberIds.length < 1) {
        throw new Error('Group conversation must have at least 2 members.');
      }

      const conversation = await this.prisma.conversation.create({
        data: {
          type: 'group',
          name: dto.name,
          created_by_id: userId,
          members: {
            create: [
              { user_id: userId, role: 'admin' }, // người tạo là admin
              ...dto.memberIds.map((id) => ({
                user_id: id,
                role: MemberRole.member,
              })),
            ],
          },
        },
        include: { members: { include: { user: true } } },
      });

      return this.toConversationResponse(conversation);
    }

    throw new Error('Invalid conversation type');
  }

  // Lấy danh sách conversation user đang tham gia
  async findAllByUser(userId: string): Promise<ConversationResponseDto[]> {
    const conversations = await this.prisma.conversation.findMany({
      where: { members: { some: { user_id: userId } } },
      include: {
        members: { include: { user: true } },
        messages: {
          orderBy: { created_at: 'desc' },
          take: 1,
          include: { sender: true },
        },
      },
      orderBy: { updated_at: 'desc' },
    });

    return conversations.map((c) => this.toConversationResponse(c));
  }

  //search by query
  async searchConversations(userId: string, where: any) {
    const conditions: string[] = [];
    const params: any[] = [];

    conditions.push(`EXISTS (
    SELECT 1 FROM ConversationMember cm
    WHERE cm.conversation_id = c.conversation_id
    AND cm.user_id = ?
  )`);
    params.push(userId);

    if (where.name) {
      const lowerName = `%${where.name.toLowerCase()}%`;
      conditions.push(`(
      (c.type = 'group' AND LOWER(c.name) LIKE ?)
      OR
      (c.type = 'private' AND EXISTS (
        SELECT 1 FROM ConversationMember cm2
        JOIN User u2 ON u2.user_id = cm2.user_id
        WHERE cm2.conversation_id = c.conversation_id
        AND cm2.user_id <> ?
        AND LOWER(u2.username) LIKE ?
      ))
    )`);
      params.push(lowerName, userId, lowerName);
    }

    if (where.type) {
      conditions.push(`c.type = ?`);
      params.push(where.type);
    }

    if (where.memberId) {
      conditions.push(`EXISTS (
      SELECT 1 FROM ConversationMember cm3
      WHERE cm3.conversation_id = c.conversation_id
      AND cm3.user_id = ?
    )`);
      params.push(where.memberId);
    }

    const query = `
    SELECT c.conversation_id
    FROM Conversation c
    ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
    ORDER BY c.updated_at DESC
  `;

    // chỉ lấy id trước
    const rows = await this.prisma.$queryRawUnsafe<
      { conversation_id: string }[]
    >(query, ...params);

    // load lại bằng prisma -> trả về DTO chuẩn
    const conversations = await this.prisma.conversation.findMany({
      where: { conversation_id: { in: rows.map((r) => r.conversation_id) } },
      include: {
        members: { include: { user: true } },
        messages: {
          orderBy: { created_at: 'desc' },
          take: 1,
          include: { sender: true },
        },
      },
      orderBy: { updated_at: 'desc' },
    });

    return conversations.map((c) => this.toConversationResponse(c));
  }

  // Lấy chi tiết 1 conversation
  async findOne(
    conversationId: string,
    userId: string,
  ): Promise<ConversationResponseDto> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { conversation_id: conversationId },
      include: {
        members: { include: { user: true } },
        messages: {
          orderBy: { created_at: 'desc' },
          take: 1,
          include: { sender: true },
        },
      },
    });

    if (!conversation) throw new NotFoundException('Conversation not found');
    const isMember = conversation.members.some((m) => m.user_id === userId);
    if (!isMember)
      throw new ForbiddenException('You are not a member of this conversation');

    return this.toConversationResponse(conversation);
  }

  // Update conversation (chỉ admin được sửa)
  async update(
    conversationId: string,
    userId: string,
    dto: UpdateConversationDto,
  ) {
    const member = await this.prisma.conversationMember.findUnique({
      where: {
        conversation_id_user_id: {
          user_id: userId,
          conversation_id: conversationId,
        },
      },
    });
    if (!member || member.role !== 'admin')
      throw new ForbiddenException('Not allowed');

    const conversation = await this.prisma.conversation.update({
      where: { conversation_id: conversationId },
      data: { name: dto.name },
      include: { members: { include: { user: true } } },
    });

    return this.toConversationResponse(conversation);
  }

  // Add member
  async addMember(conversationId: string, userId: string, dto: AddMemberDto) {
    const member = await this.prisma.conversationMember.findUnique({
      where: {
        conversation_id_user_id: {
          user_id: userId,
          conversation_id: conversationId,
        },
      },
    });
    if (!member || member.role !== 'admin')
      throw new ForbiddenException('Not allowed');

    await this.prisma.conversationMember.create({
      data: {
        conversation_id: conversationId,
        user_id: dto.userId,
        role: 'member',
      },
    });

    return { success: true };
  }

  // Remove member
  async removeMember(
    conversationId: string,
    userId: string,
    dto: RemoveMemberDto,
  ) {
    const member = await this.prisma.conversationMember.findUnique({
      where: {
        conversation_id_user_id: {
          user_id: userId,
          conversation_id: conversationId,
        },
      },
    });
    if (!member || member.role !== 'admin')
      throw new ForbiddenException('Not allowed');

    await this.prisma.conversationMember.delete({
      where: {
        conversation_id_user_id: {
          user_id: dto.userId,
          conversation_id: conversationId,
        },
      },
    });

    return { success: true };
  }

  // --- Mapper: Convert Prisma → DTO response
  private toConversationResponse(c: any): ConversationResponseDto {
    return {
      conversation_id: c.conversation_id,
      type: c.type,
      name: c.name,
      created_at: c.created_at,
      created_by_id: c.created_by_id,
      members: c.members.map((m) => ({
        user_id: m.user.user_id,
        username: m.user.username,
        avatar_url: m.user.avatar_url,
        role: m.role,
        joined_at: m.joined_at,
      })),
      lastMessage: c.messages?.[0]
        ? {
            message_id: c.messages[0].message_id,
            content: c.messages[0].content,
            created_at: c.messages[0].created_at,
            sender: {
              user_id: c.messages[0].sender.user_id,
              username: c.messages[0].sender.username,
              avatar_url: c.messages[0].sender.avatar_url,
            },
          }
        : undefined,
      unreadCount: 0, // TODO: tính sau
      initials: c.name?.slice(0, 2).toUpperCase() || 'NA',
    };
  }
}
