import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { ChatModule } from '../chat/chat.module';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { ChatService } from '../chat/chat.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [ChatModule, PrismaModule],
  providers: [MessageGateway, MessageService, JwtService, PrismaService, AuthService, ChatService],
})
export class MessageModule {}
