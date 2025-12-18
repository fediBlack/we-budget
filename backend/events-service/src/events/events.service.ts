import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { EventStatus } from '../../node_modules/.prisma/client-events';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  // 📋 List all events for a user
  async findAll(userId: number, status?: EventStatus): Promise<any[]> {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    return this.prisma.event.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        notifications: {
          select: { id: true, channel: true, readAt: true },
        },
      },
    });
  }

  // 🔍 Get a single event
  async findOne(id: number, userId: number): Promise<any> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        notifications: true,
      },
    });

    if (!event) {
      throw new NotFoundException(`Event #${id} not found`);
    }

    if (event.userId !== userId) {
      throw new ForbiddenException('You do not have access to this event');
    }

    return event;
  }

  // ➕ Create a new event
  async create(userId: number, dto: CreateEventDto): Promise<any> {
    return this.prisma.event.create({
      data: {
        userId,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        metadata: dto.metadata,
      },
    });
  }

  // ✏️ Update event status (mark as read/archived)
  async update(id: number, userId: number, dto: UpdateEventDto): Promise<any> {
    const event = await this.findOne(id, userId);

    const data: any = {};
    if (dto.status === 'READ' && !event.readAt) {
      data.status = 'READ';
      data.readAt = new Date();
    } else if (dto.status === 'ARCHIVED' && !event.archivedAt) {
      data.status = 'ARCHIVED';
      data.archivedAt = new Date();
    }

    return this.prisma.event.update({
      where: { id },
      data,
    });
  }

  // 🗑️ Delete an event
  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    
    await this.prisma.event.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully' };
  }

  // 📊 Get event stats
  async getStats(userId: number) {
    const [total, pending, read, archived] = await Promise.all([
      this.prisma.event.count({ where: { userId } }),
      this.prisma.event.count({ where: { userId, status: 'PENDING' } }),
      this.prisma.event.count({ where: { userId, status: 'READ' } }),
      this.prisma.event.count({ where: { userId, status: 'ARCHIVED' } }),
    ]);

    return {
      total,
      pending,
      read,
      archived,
    };
  }
}
