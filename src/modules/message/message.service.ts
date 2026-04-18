import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UUID } from 'crypto';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';

@Injectable()
export class MessageService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  @WebSocketServer()
  server!: Server;

  async onModuleInit() {
    await this.prisma.user.updateMany({
      data: { isOnline: false }
    });
  }

  async isParticipant(conversationId: UUID, userId: UUID): Promise<boolean> {
    const participant = await this.prisma.participant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: conversationId,
          userId: userId,
        },
      },
    });
    return !!participant;
  }

  async setOnlineStatus(userId: UUID, isOnline: boolean) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isOnline },
    });
    return { userId, isOnline };
  }

  async isOnline(userId: UUID): Promise<boolean> {
    const online = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isOnline: true },
    });
    return online?.isOnline || false;
  }

}

