import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto, UpdatePreferencesDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // 📋 List all notifications for a user
  async findAll(userId: number, unreadOnly: boolean = false) {
    const where: any = { userId };
    if (unreadOnly) {
      where.readAt = null;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: { sentAt: 'desc' },
      include: {
        event: {
          select: { id: true, type: true, title: true },
        },
      },
    });
  }

  // ➕ Create a notification
  async create(userId: number, dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId,
        eventId: dto.eventId,
        channel: dto.channel,
        title: dto.title,
        body: dto.body,
      },
    });
  }

  // ✅ Mark notification as read
  async markAsRead(id: number, userId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  // ✅ Mark all as read
  async markAllAsRead(userId: number) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });

    return { count: result.count };
  }

  // 🗑️ Delete a notification
  async remove(id: number, userId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await this.prisma.notification.delete({ where: { id } });
    return { message: 'Notification deleted' };
  }

  // ⚙️ Get preferences
  async getPreferences(userId: number) {
    let prefs = await this.prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!prefs) {
      prefs = await this.prisma.notificationPreferences.create({
        data: { userId },
      });
    }

    return prefs;
  }

  // ⚙️ Update preferences
  async updatePreferences(userId: number, dto: UpdatePreferencesDto) {
    const existing = await this.prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (existing) {
      return this.prisma.notificationPreferences.update({
        where: { userId },
        data: dto,
      });
    } else {
      return this.prisma.notificationPreferences.create({
        data: {
          userId,
          ...dto,
        },
      });
    }
  }

  // 📊 Get notification stats
  async getStats(userId: number) {
    const [total, unread] = await Promise.all([
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, readAt: null } }),
    ]);

    return { total, unread };
  }
}
