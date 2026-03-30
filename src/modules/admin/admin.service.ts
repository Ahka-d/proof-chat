import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      activeUsers,
      totalConversations,
      totalMessages,
      unreadStats,
      topUsers,
      topConversations,
      usersByRole
    ] = await Promise.all([
      this.getActiveUsersCount(),
      this.getTotalConversations(),
      this.getTotalMessages(),
      this.getReadVsUnreadMessages(),
      this.getTopUsersByMessages(),
      this.getTopConversationsByMessages(),
      this.getUsersByRole(),
    ]);

    return {
      activeUsers,
      totalConversations,
      totalMessages,
      unreadStats,
      topUsers,
      topConversations,
      usersByRole,
    };
  }

  // 1. Total de usuarios activos (isOnline = true)
  private async getActiveUsersCount() {
    return this.prisma.user.count({
      where: { isOnline: true, isBanned: false },
    });
  }

  // 2. Total de conversaciones
  private async getTotalConversations() {
    return this.prisma.conversation.count();
  }

  // 3. Total de mensajes enviados
  private async getTotalMessages() {
    return this.prisma.message.count();
  }

  // 4. Top 5 usuarios con más mensajes enviados
  private async getTopUsersByMessages() {
    return this.prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        username: true,
        _count: { select: { messages: true } },
      },
      orderBy: {
        messages: { _count: 'desc' },
      },
    });
  }

  // 5. Top 5 conversaciones con más mensajes
  private async getTopConversationsByMessages() {
    return this.prisma.conversation.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        _count: { select: { messages: true } },
      },
      orderBy: {
        messages: { _count: 'desc' },
      },
    });
  }

  // 6. Cantidad de mensajes leídos vs no leídos 
  private async getReadVsUnreadMessages() {
    const readCount = await this.prisma.message.count({
      where: { reads: { some: {} } },
    });
    const unreadCount = await this.prisma.message.count({
      where: { reads: { none: {} } },
    });
    return { readCount, unreadCount };
  }

  // 7. Cantidad de usuarios por equipo (Role)
  private async getUsersByRole() {
    return await this.prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    });
  }
}

