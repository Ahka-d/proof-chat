import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { type UUID } from 'crypto';
import { ChatEntity } from './entities/chat.entity';
import { ParticipantEntity } from './entities/participant.entity';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findOneChat(conversationId: UUID, userId: UUID) {
    if (!await this.isParticipant(conversationId, userId)) {
      throw new Error('Access denied: User is not a participant of the chat');
    }
    const chat = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: { userId: userId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });
    if (!chat) {
      throw new Error('Chat not found or access denied');
    }
    return new ChatEntity(chat);
  }

  async findAllChats(id: UUID) {
    console.log(`Finding all chats for user ${id}`);
    const chats = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: id },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });
    return chats.map(chat => new ChatEntity(chat));
  }

  async findParticipants(conversationId: UUID, userId: UUID) {
    if (!await this.isParticipant(conversationId, userId)) {
      throw new Error('User is not a participant of the chat');
    }
    const participants: ParticipantEntity[] = (await this.findOneChat(conversationId, userId)).participants.map(p => new ParticipantEntity(p));
    return participants.map(participant => participant.displayNames);
  }

  async createChat(userIds: UUID[]) {
      if (userIds.length < 2) {
        throw new Error('A chat must have at least 2 participants');
      }
      const isGroup: boolean = userIds.length > 2;
      try {
        return await this.prisma.conversation.create({
          data: {
            isGroup: isGroup,
            participants: {
              create: userIds.map(id => ({ userId: id }))
            }
          }
        });
      } catch (e) {
        console.error('Error creando el chat:', e);
        throw new Error('Fallo creando el chat');
      }
    }

  async addToChat(userId: UUID, conversationId: UUID, requesterId: UUID) {
    try {
      if (!await this.isParticipant(conversationId, requesterId)) {
        throw new Error('Only participants can add users to the chat');
      }
      if (await this.isParticipant(conversationId, userId)) {
        throw new Error('User is already a participant of the chat');
      }
    const participant = await this.prisma.participant.create({
      data: {
        userId: userId,
        conversationId: conversationId,
      },
    });
    if (!participant) {
      throw new Error('Fallo al agregar usuarios al chat');
     }
     console.log(`User ${userId} added to conversation ${conversationId}`);

    const isGroup = await this.isGroup(conversationId);
      if (isGroup) {
        console.log(`Conversation ${conversationId} is now a group chat`);
      }
    
    return participant;
    } catch (e) {
      console.error('Error agregando usuarios al chat:', e);
      throw new Error('Fallo agregando usuarios al chat');
    }
  }

  async isGroup(conversationId: string): Promise<boolean> {
    try {
    const count = await this.prisma.participant.count({
      where: { conversationId: conversationId },
    });
    if (count > 2) {
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { isGroup: true },
       });
    }
    return count > 2;
    }catch (e) {
      console.error('Error revisando si el chat es grupal:', e);
      throw new Error('Fallo revisando si el chat es grupal');
    }
  }

  async updateTitle(id: string, title: string) {
    try {
      if (title.length > 20 || title.length < 1) {
        throw new Error('Chat title must be between 1 and 20 characters');
      }
      if (await this.isGroup(id) === false) {
        throw new Error('Only group chats can have a title');
      }
      const updated = await this.prisma.conversation.update({
        where: { id: id },
        data: { title: title },
      });
      if (!updated) {
        throw new Error('Failed to update chat title');
      }
      return new ChatEntity(updated).displayName;
    } catch (e) {
      console.error('Error actualizando el titulo del chat:', e);
      throw new Error('Fallo al actualizar titulo');
    }
  }

  async abandonChat(conversationId: UUID, id: UUID) {
    const userId = id;
    try {
      if(await this.prisma.participant.count({
        where: {
          conversationId: conversationId,
        }
      }) < 1) {
        await this.prisma.conversation.delete({
          where: {
            id: conversationId,
          },
        });
        return { success: true };
      }
      await this.prisma.participant.delete({
        where: {
          conversationId_userId: {
            conversationId: conversationId,
            userId: userId,
          },
        },
      });

      return { success: true };
    } catch (error) {
      throw new Error('No se pudo abandonar la conversación o no eras miembro.');
    }
  }

}
