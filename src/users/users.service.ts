import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
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
}
