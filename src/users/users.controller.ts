import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AddFriendDto } from './dto/add-friend.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers(@Query() query: any) {
    if (Object.keys(query).length > 0) {
      console.log(query);
      return this.usersService.findUsers(query);
    }
    return this.usersService.getAllUsers();
  }

  @Public()
  @Post('createUser')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Post('add-friend')
  async addFriend(@Req() req, @Body() dto: AddFriendDto) {
    const userId = req.user.userId;
    return this.usersService.addFriend(userId, dto);
  }

  @Patch('accept-friend/:friendId')
  async acceptFriend(@Req() req, @Param('friendId') friendId: string) {
    const userId = req.user.userId;
    return this.usersService.acceptFriend(userId, friendId);
  }
}
