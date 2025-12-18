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
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { EventStatus } from '@prisma/client';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll(
    @Request() req: ExpressRequest & { user: { userId: number } },
    @Query('status') status?: EventStatus,
  ) {
    return this.eventsService.findAll(req.user.userId, status);
  }

  @Get('stats')
  getStats(@Request() req: ExpressRequest & { user: { userId: number } }) {
    return this.eventsService.getStats(req.user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest & { user: { userId: number } },
  ) {
    return this.eventsService.findOne(id, req.user.userId);
  }

  @Post()
  create(
    @Request() req: ExpressRequest & { user: { userId: number } },
    @Body() dto: CreateEventDto,
  ) {
    return this.eventsService.create(req.user.userId, dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest & { user: { userId: number } },
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest & { user: { userId: number } },
  ) {
    return this.eventsService.remove(id, req.user.userId);
  }
}
