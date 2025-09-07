import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { RemoveMemberDto } from './dto/remove-member.dto';

@Controller('api/conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  // create
  @Post()
  async create(@Req() req: any, @Body() dto: CreateConversationDto) {
    return this.conversationsService.create(req.user.userId, dto);
  }

  // get list
  @Get()
  async findAll(@Req() req: any) {
    return this.conversationsService.findAllByUser(req.user.userId);
  }

  @Get('search')
  async searchConversations(@Req() req, @Query() query: any) {
    const userId = req.user.userId;
    return this.conversationsService.searchConversations(userId, query);
  }

  // conservation detail
  @Get(':id')
  async findOne(@Param('id') conversationId: string, @Req() req: any) {
    return this.conversationsService.findOne(conversationId, req.user.userId);
  }

  //update conservation (admin)
  @Patch(':id')
  async update(
    @Param('id') conversationId: string,
    @Req() req: any,
    @Body() dto: UpdateConversationDto,
  ) {
    return this.conversationsService.update(
      conversationId,
      req.user.userId,
      dto,
    );
  }

  //add member (admin)
  @Post(':id/members')
  async addMember(
    @Param('id') conversationId: string,
    @Req() req: any,
    @Body() dto: AddMemberDto,
  ) {
    return this.conversationsService.addMember(
      conversationId,
      req.user.userId,
      dto,
    );
  }

  //remove member (admin)
  @Delete(':id/members')
  async removeMember(
    @Param('id') conversationId: string,
    @Req() req: any,
    @Body() dto: RemoveMemberDto,
  ) {
    return this.conversationsService.removeMember(
      conversationId,
      req.user.userId,
      dto,
    );
  }
}
