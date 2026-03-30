import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { request } from 'http';
import { UserEntity } from './entities/user.entity';
import { type UUID } from 'crypto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
  ) {}

 async findOne(id: string): Promise<UserEntity> {
  console.log('Finding user with ID:', id);
    try{
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      if (!user) {
        throw new Error('User not found');
      }
      return new UserEntity(user);
    }catch(error){
      console.error('Error finding user:', error);
      throw new Error('Failed to find user');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { username, email, password } = updateUserDto;
    try{
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          username: username ? username : undefined,
          email: email ? email : undefined,
          password: password ? password : undefined,
        },
      });
      return new UserEntity(updatedUser);
    }catch(error){
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  async remove(id: string) {
    try {
      const deletedUser = await this.prisma.user.delete({
        where: { id },
      });
      return new UserEntity(deletedUser);
      
    } catch (error) {
      console.error('Error removing user:', error);
      throw new Error('Failed to remove user');
    }
  }
}
