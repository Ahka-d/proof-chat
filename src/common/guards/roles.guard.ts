import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { rolesDto } from '../dto/roles.dto';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor() {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    console.log('User in RolesGuard:', user);
    if (!user) return false;

    try {
      console.log('Checking user role in RolesGuard:', user.role);
      return user.role === 'ADMIN' ? true : false; 

    } catch (error) {
      console.error('Error in RolesGuard:', error);
      return false;
    }
  }
  
}
