import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateNotificationDto, UpdatePreferencesDto } from './dto/notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(
    @Request() req: ExpressRequest & { user: { userId: number } },
    @Query('unreadOnly', new ParseBoolPipe({ optional: true })) unreadOnly?: boolean,
  ) {
    return this.notificationsService.findAll(req.user.userId, unreadOnly || false);
  }

  @Get('stats')
  getStats(@Request() req: ExpressRequest & { user: { userId: number } }) {
    return this.notificationsService.getStats(req.user.userId);
  }

  @Get('preferences')
  getPreferences(@Request() req: ExpressRequest & { user: { userId: number } }) {
    return this.notificationsService.getPreferences(req.user.userId);
  }

  @Put('preferences')
  updatePreferences(
    @Request() req: ExpressRequest & { user: { userId: number } },
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.notificationsService.updatePreferences(req.user.userId, dto);
  }

  @Post()
  create(
    @Request() req: ExpressRequest & { user: { userId: number } },
    @Body() dto: CreateNotificationDto,
  ) {
    return this.notificationsService.create(req.user.userId, dto);
  }

  @Put(':id/read')
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest & { user: { userId: number } },
  ) {
    return this.notificationsService.markAsRead(id, req.user.userId);
  }

  @Put('read-all')
  markAllAsRead(@Request() req: ExpressRequest & { user: { userId: number } }) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest & { user: { userId: number } },
  ) {
    return this.notificationsService.remove(id, req.user.userId);
  }
}
