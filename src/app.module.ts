import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/user.module';
import { ChatModule } from './modules/chat/chat.module';
import { AdminModule } from './modules/admin/admin.module';
import { MessageModule } from './modules/message/message.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, ChatModule, AdminModule, MessageModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
