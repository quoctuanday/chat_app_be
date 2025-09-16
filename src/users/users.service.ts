import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AddFriendDto } from './dto/add-friend.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  private readonly logger = new Logger(UsersService.name);
  async updateUserStatus(
    userId: string,
    status: 'online' | 'offline' | 'busy',
  ) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });
    if (!user) {
      this.logger.warn(`User not found: ${userId}`);
      return null;
    }
    return this.prisma.user.update({
      where: { user_id: userId },
      data: { status },
    });
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw new BadRequestException('User không tồn tại');
    }

    const updateData: any = { ...dto };

    return this.prisma.user.update({
      where: { user_id: userId },
      data: updateData,
    });
  }

  async createUser(dto: CreateUserDto) {
    const saltRounds = 10;
    console.log(dto);

    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);
    return this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        email: dto.email,
      },
    });
  }
  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        user_id: true,
        username: true,
        email: true,
        created_at: true,
      },
    });
  }

  async findUser(where: any) {
    return this.prisma.user.findFirst({ where });
  }

  async findUsers(where: any) {
    const conditions: string[] = [];
    const params: any[] = [];

    if (where.username) {
      conditions.push(`LOWER(username) LIKE ?`);
      params.push(`%${where.username.toLowerCase()}%`);
    }

    if (where.email) {
      conditions.push(`LOWER(email) LIKE ?`);
      params.push(`%${where.email.toLowerCase()}%`);
    }

    const query = `
    SELECT user_id, username, email, created_at
    FROM User
    ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
  `;

    return this.prisma.$queryRawUnsafe(query, ...params);
  }
  async addFriend(userId: string, dto: AddFriendDto) {
    if (userId === dto.friend_id) {
      throw new BadRequestException('Bạn không thể kết bạn với chính mình');
    }

    // kiểm tra xem đã tồn tại chưa
    const existing = await this.prisma.friendship.findUnique({
      where: {
        user_id_friend_id: {
          user_id: userId,
          friend_id: dto.friend_id,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Bạn đã gửi lời mời hoặc đã là bạn bè');
    }

    return this.prisma.friendship.create({
      data: {
        user_id: userId,
        friend_id: dto.friend_id,
        status: 'pending',
      },
    });
  }

  async acceptFriend(userId: string, friendId: string) {
    return this.prisma.friendship.update({
      where: {
        user_id_friend_id: {
          user_id: friendId,
          friend_id: userId,
        },
      },
      data: { status: 'accepted' },
    });
  }
}
