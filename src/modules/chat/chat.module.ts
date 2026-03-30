import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [ChatModule],
  controllers: [ChatController],
  providers: [ChatController, ChatService, AuthService, JwtService, PrismaService],
})
export class ChatModule {}
