import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRoomDto, SendMessageDto } from './dto/chat.dto';
import { Request as ExpressRequest } from 'express';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('rooms')
  async createRoom(
    @Request() req: ExpressRequest & { user: { userId: number } },
    @Body() dto: CreateRoomDto,
  ) {
    return this.chatService.createRoom(req.user.userId, dto);
  }

  @Get('rooms')
  async getRooms(@Request() req: ExpressRequest & { user: { userId: number } }) {
    return this.chatService.getRoomsByUser(req.user.userId);
  }

  @Post('rooms/:roomId/members')
  async addMember(
    @Request() req: ExpressRequest & { user: { userId: number } },
    @Param('roomId') roomId: string,
    @Body('userId') newUserId: number,
  ) {
    return this.chatService.addMemberToRoom(+roomId, req.user.userId, newUserId);
  }

  @Get('rooms/:roomId/messages')
  async getMessages(
    @Request() req: ExpressRequest & { user: { userId: number } },
    @Param('roomId') roomId: string,
    @Query('limit') limit?: string,
  ) {
    return this.chatService.getMessages(
      +roomId,
      req.user.userId,
      limit ? +limit : 50,
    );
  }

  @Post('messages')
  async sendMessage(
    @Request() req: ExpressRequest & { user: { userId: number } },
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(req.user.userId, dto);
  }
}
