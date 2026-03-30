import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsBannedGuard implements CanActivate {

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();

      if (client.data.user.isBanned) {
        throw new WsException('User is banned');
      }

      return true;
    } catch (err) {
      throw new WsException('Invalid credentials');
    }
  }
}