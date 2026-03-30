import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ParticipantEntity } from 'src/modules/chat/entities/participant.entity';

export class UserEntity {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Unique identifier for the user, formato UUID' })
  id: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email address of the user' })
  email: string;

  @ApiProperty({ example: 'john_doe', description: 'Username of the user' })
  username: string;

  @ApiProperty({ example: 'USER', description: 'Role of the user' })
  role: string;

  @ApiProperty({ example: false, description: 'Indicates if the user is online' })
  isOnline: boolean;

  @ApiProperty({ example: false, description: 'Indicates if the user is banned' })
  isBanned: boolean;

  @ApiProperty({ example: new Date(), description: 'Timestamp when the user was created' })
  createdAt: Date;

  @ApiProperty({ example: new Date(), description: 'Timestamp when the user was last updated' })
  updatedAt: Date;

  @Exclude()
  password: string;

  // Relaciones opcionales (solo si haces include en Prisma)
  @ApiProperty({ example: [], description: 'List of messages sent by the user', required: false })
  messages?: any[]; 
  @ApiProperty({ example: [], type: () => [ParticipantEntity], description: 'List of participations in conversations', required: false })
  participations?: any[];

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}