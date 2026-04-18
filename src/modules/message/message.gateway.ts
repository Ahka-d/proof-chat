import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, WsException } from '@nestjs/websockets';
import { MessageService } from './message.service';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { ChatService } from '../chat/chat.service';
import { AuthService } from '../auth/auth.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from 'src/common/guards/ws-jwt.guard';
import { UUID } from 'crypto';
import { WsBannedGuard } from 'src/common/guards/ws-banned.guard';
import { MessageEntity } from './entities/message.entity';
import { ApiTags} from '@nestjs/swagger'

@ApiTags('Protocol: Websockets')
@WebSocketGateway()
export class MessageGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly authService: AuthService, private readonly messageService: MessageService, private prisma: PrismaService, private readonly chatService: ChatService) {}
  
  @WebSocketServer()
  server!: Server;

  async afterInit(server: Server) {
    this.server = server
    console.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
  try {
    const authHeader = client.handshake.headers.authorization;
    if (!authHeader) throw new Error('No authorization header');

    const token = authHeader.split(' ')[1];
    if (!token) throw new Error('Invalid token format');

    const payload = await this.authService.verifyJwt(token);
    if (!payload) throw new Error('Invalid user')
    
    const userId: UUID = payload.id as UUID;
    if (!userId) throw new Error('User ID not found in payload');

    client.data.user = { ...payload, userId }; 

    const [onlineStatus, userPart] = await Promise.all([
      this.messageService.setOnlineStatus(userId, true),
      this.prisma.participant.findMany({
        where: { userId: userId },
        select: { conversationId: true }
      })
    ]);

    for (const part of userPart) {
      client.join(`conv_${part.conversationId}`);
    }

    console.log(`User ${userId} connected. Rooms joined: ${userPart.length}`);
    
  } catch (e) {
    console.error(`Connection rejected: ${e}`);
    client.disconnect();
  }
}

  async handleDisconnect(client: Socket){
    const onlineStatus = await this.messageService.setOnlineStatus(client.data.user.id||client.data.user.sub, false);
    console.log(`Client disconnected: ${client.id} - Online status: ${onlineStatus.isOnline}`)
  }

  // Events, Messages & Rooms

  //Join.
  @UseGuards(WsJwtGuard, WsBannedGuard)
  @SubscribeMessage('joinRoom')
  async handleJoinChat(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: UUID }
  ) {
    const userId = client.data.user.sub;
    const isParticipant = await this.messageService.isParticipant(data.conversationId, userId);

    if (!isParticipant) {
      throw new WsException('No tienes permiso para unirte a esta conversación');
    }

    const roomName = `conv_${data.conversationId}`;
    client.join(roomName);

    console.log(`Usuario ${userId} se unió a la sala ${roomName}`);
    return { status: 'joined', room: roomName };
  }
  //Leave, abandon.
  @UseGuards(WsJwtGuard, WsBannedGuard)
  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: UUID, abandon?: boolean }
  ) {
    try {      
      const userId = client.data.user.sub;
      const isParticipant = await this.messageService.isParticipant(data.conversationId, userId);

      if (!isParticipant) {
        throw new WsException('No perteneces a esta conversación');
      }
      const roomName = `conv_${data.conversationId}`;  
      client.leave(roomName);
      console.log(`Cliente ${client.id} salió de la sala: ${roomName}`);

      if (data.abandon) {
        await this.chatService.abandonChat(data.conversationId, userId);
      }
      this.server.to(roomName).emit('userLeft', { userId, conversationId: data.conversationId });
      return { status: 'left', room: roomName };
    }catch (e) {    
      throw new WsException('No se pudo abandonar la conversación o no eras miembro.');
    }
  }
  // Send message.
  @UseGuards(WsJwtGuard, WsBannedGuard)
  @SubscribeMessage('sendMessage')
    async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: UUID; content: string },
    ) {
      const userId = client.data.user.sub;

      const isParticipant = await this.messageService.isParticipant(data.conversationId, userId);

      if (!isParticipant) {
        throw new WsException('No tienes permiso para enviar mensajes en esta conversación');
      }
      const newMessage = await this.prisma.message.create({
        data: {
          content: data.content,
          senderId: userId,
          conversationId: data.conversationId,
        },
        include: {
          sender: { select: { username: true } },
        },
      });
      this.server
        .to(`conv_${data.conversationId}`)
        .emit('newMessage', new MessageEntity(newMessage));

      return newMessage;
    }
  // Update message.
  @UseGuards(WsJwtGuard, WsBannedGuard)
  @SubscribeMessage('updateMessage')
  async handleUpdateMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: UUID; messageId: UUID; content: string }) {
    const userId = client.data.user.sub;

    const message = await this.prisma.message.findUnique({
      where: { id: data.messageId },
      select: { senderId: true, conversationId: true }
    });

    if (!message) {
      throw new WsException('Mensaje no encontrado');
    }

    if (message.senderId !== userId) {
      throw new WsException('No puedes editar un mensaje que no has enviado');
    }

    if (message.conversationId !== data.conversationId) {
      throw new WsException('El mensaje no pertenece a esta conversación');
    }

    const updatedMessage = await this.prisma.message.update({
      where: { id: data.messageId },
      data: { content: data.content },
      include: {
        sender: { select: { username: true } },
      },
    });

    this.server
      .to(`conv_${data.conversationId}`)
      .emit('updateMessage', new MessageEntity(updatedMessage));

    return updatedMessage;
  }
  // Delete message.
  @UseGuards(WsJwtGuard, WsBannedGuard)
  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: UUID; messageId: UUID }) {
    const userId = client.data.user.sub;

    const message = await this.prisma.message.findUnique({
      where: { id: data.messageId },
      select: { senderId: true, conversationId: true }
    });

    if (!message) {
      throw new WsException('Mensaje no encontrado');
    }

    if (message.senderId !== userId) {
      throw new WsException('No puedes eliminar un mensaje que no has enviado');
    }

    if (message.conversationId !== data.conversationId) {
      throw new WsException('El mensaje no pertenece a esta conversación');
    }

    await this.prisma.message.delete({
      where: { id: data.messageId },
    });

    this.server
      .to(`conv_${data.conversationId}`)
      .emit('deleteMessage', { messageId: data.messageId });

    return { success: true };
  }
  // History messages.
  @UseGuards(WsJwtGuard, WsBannedGuard)
  @SubscribeMessage('historyMessages')
  async handleHistoryMessages(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: UUID }) {
    const userId = client.data.user.sub;

    const isParticipant = await this.messageService.isParticipant(data.conversationId, userId);

    if (!isParticipant) {
      throw new WsException('No tienes permiso para ver los mensajes de esta conversación');
    }
    
    const messages = await this.prisma.message.findMany({
      where: { conversationId: data.conversationId },
      include: { sender: { select: { username: true } } },
      orderBy: { createdAt: 'asc' },
    });

    const historyMsg = messages.map(msg => new MessageEntity(msg));

    return client.emit('historyMessages', historyMsg);
  }
  // Mark group as read.
  @UseGuards(WsJwtGuard, WsBannedGuard)
  @SubscribeMessage('markGroupAsRead')
  async handleMarkGroupAsRead(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: UUID }) {
    const userId = client.data.user.sub;

    const unreadMessages = await this.prisma.message.findMany({
      where: {
        conversationId: data.conversationId,
        senderId: { not: userId },
        reads: {
          none: { userId: userId }
        }
      },
      select: { id: true }
    });

    if (unreadMessages.length > 0) {
      await this.prisma.messageRead.createMany({
        data: unreadMessages.map(msg => ({
          messageId: msg.id,
          userId: userId,
        })),
        skipDuplicates: true,
      });

      this.server.to(`conv_${data.conversationId}`).emit('userReadMessages', {
        conversationId: data.conversationId,
        userId: userId,
        lastReadAt: new Date(),
      });
    }

    return { success: true, count: unreadMessages.length };
  }
  // Mark as read, single message.
  @UseGuards(WsJwtGuard, WsBannedGuard)
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: UUID; messageId: UUID }) {
    const userId = client.data.user.sub;

    const isParticipant = await this.messageService.isParticipant(data.conversationId, userId);

    if (!isParticipant) {
      throw new WsException('No tienes permiso para marcar mensajes de esta conversación');
    }
    
    const message = await this.prisma.message.findUnique({
      where: { id: data.messageId },
      select: { conversationId: true, senderId: true }
    });

    if (!message) {
      throw new WsException('Mensaje no encontrado');
    }

    if (message.senderId === userId) {
      throw new WsException('No puedes marcar como leído tu propio mensaje');
    }

    if (message.conversationId !== data.conversationId) {
      throw new WsException('El mensaje no pertenece a esta conversación');
    }

    await this.prisma.messageRead.create({
      data: {
        messageId: data.messageId,
        userId: userId,
      }
    });

    this.server.to(`conv_${message.conversationId}`).emit('userReadMessages', {
      conversationId: message.conversationId,
      userId: userId,
      lastReadAt: new Date(),
    });

    return { success: true };
  }

}
