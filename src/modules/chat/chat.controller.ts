import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { type UUID } from 'crypto';
import { JwtGuard } from 'src/common/guards/auth.guard';
import { BannedGuard } from 'src/common/guards/banned.guard';
import { GetUser } from 'src/common/decorators/user.decorator';
import { CreateChatDto, AddToChatDto } from './dto/create-chat.dto';
import { UpdateChatTitleDto } from './dto/update-chat.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Chat')
@ApiBearerAuth('access-token')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Get all chats for user.
  @ApiOperation({ summary: 'Obtener todos los chats del usuario' , description: 'Devuelve una lista de todas las conversaciones en las que el usuario es participante.' })
  @UseGuards(JwtGuard, BannedGuard)
  @Get()
  async findAll(@GetUser() user: Object) {
    return await this.chatService.findAllChats(user['id']);
  }
  // Get chat by id.
  @ApiOperation({ summary: 'Obtener detalles de un chat específico' , description: 'Devuelve los detalles de una conversación específica a la que el usuario tiene acceso.' })
  @UseGuards(JwtGuard, BannedGuard)
  @Get(':conversationId')
  async findOne(@GetUser() user: Object, @Param('conversationId') conversationId: UUID) {
    return await this.chatService.findOneChat(conversationId, user['id']);
  }
  //Get all participants of a chat.
  @ApiOperation({ summary: 'Obtener participantes de un chat' , description: 'Devuelve una lista de los participantes de una conversación específica a la que el usuario tiene acceso.' })
  @UseGuards(JwtGuard, BannedGuard)
  @Get(':conversationId/participants')
  async findParticipants(@GetUser() user: Object, @Param('conversationId') conversationId: UUID) {
    return await this.chatService.findParticipants(conversationId, user['id']);
  }
  // create chat.
  @ApiOperation({ summary: 'Crear un nuevo chat' , description: 'Crea una nueva conversación con una lista de usuarios especificada. El usuario que crea el chat se incluye automáticamente como participante.' })
  @UseGuards(JwtGuard,BannedGuard)
  @Post('create')
  async createChat(@GetUser() user: Object, @Body() data: CreateChatDto) {
    const setUserIds: Set<UUID> = new Set([ user['id'], ...data.userIds]);
    const UserIds: UUID[] = Array.from(setUserIds);
    console.log('Creating chat with users:', UserIds);
    return await this.chatService.createChat(UserIds);
  }  
  // Add to chat.
  @ApiOperation({ summary: 'Agregar un usuario a un chat existente' , description: 'Agrega un nuevo usuario a una conversación existente. El usuario que realiza la solicitud debe ser participante de la conversación.' })
  @UseGuards(JwtGuard,BannedGuard)
  @Post('add')
  async addToChat(@GetUser() user: Object, @Body() data: AddToChatDto) {
    return await this.chatService.addToChat(data.userId, data.conversationId, user['id']);
  }
  // Update chat (title).
  @ApiOperation({ summary: 'Actualizar el título de un chat' , description: 'Actualiza el título de una conversación existente. El usuario que realiza la solicitud debe ser participante de la conversación y el chat debe ser del tipo grupo (2 users min).' })
  @UseGuards(JwtGuard,BannedGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateChatTitleDto) {
    return await this.chatService.updateTitle(id, data.title);
  }
  // Abandon chat.
  @ApiOperation({ summary: 'Abandonar un chat' , description: 'Permite a un usuario abandonar una conversación y si es el único miembro borra la conversación entera. El usuario que realiza la solicitud debe ser participante de la conversación.' })
  @UseGuards(JwtGuard,BannedGuard)
  @Delete(':conversationId')
  async abandonChat(@GetUser() user: Object, @Param('conversationId') conversationId: UUID) {
    return await this.chatService.abandonChat(conversationId, user['id']);
  }
}
