import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable, firstValueFrom } from 'rxjs';
import { AuthService } from 'src/modules/auth/auth.service';


@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return false;

    try {
      const user = await this.authService.verifyJwt(token)
      
      req.user = user;
      console.log('User attached to request:', req.user);
      return !!user;
    } catch (err) {
      return false;
    }
  }
}