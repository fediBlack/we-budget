import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto, SendMessageDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createRoom(userId: number, dto: CreateRoomDto) {
    // Ensure user exists
    await this.ensureUser(userId);

    const room = await this.prisma.room.create({
      data: {
        name: dto.name,
        accountId: dto.accountId,
        members: {
          create: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
      },
    });

    return room;
  }

  async getRoomsByUser(userId: number) {
    await this.ensureUser(userId);

    const rooms = await this.prisma.room.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return rooms;
  }

  async addMemberToRoom(roomId: number, userId: number, newUserId: number) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if requester is a member
    const isMember = room.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new NotFoundException('You are not a member of this room');
    }

    await this.ensureUser(newUserId);

    const member = await this.prisma.roomMember.create({
      data: {
        roomId,
        userId: newUserId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    return member;
  }

  async getMessages(roomId: number, userId: number, limit = 50) {
    // Verify user is member
    const member = await this.prisma.roomMember.findFirst({
      where: { roomId, userId },
    });

    if (!member) {
      throw new NotFoundException('You are not a member of this room');
    }

    const messages = await this.prisma.message.findMany({
      where: { roomId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return messages.reverse();
  }

  async sendMessage(userId: number, dto: SendMessageDto) {
    // Verify user is member
    const member = await this.prisma.roomMember.findFirst({
      where: { roomId: dto.roomId, userId },
    });

    if (!member) {
      throw new NotFoundException('You are not a member of this room');
    }

    const message = await this.prisma.message.create({
      data: {
        roomId: dto.roomId,
        userId,
        content: dto.content,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    // Update room updatedAt
    await this.prisma.room.update({
      where: { id: dto.roomId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  private async ensureUser(userId: number) {
    let user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      // Create placeholder user (should sync from auth-service)
      user = await this.prisma.user.create({
        data: {
          id: userId,
          email: `user${userId}@example.com`,
          name: `User ${userId}`,
        },
      });
    }

    return user;
  }
}
