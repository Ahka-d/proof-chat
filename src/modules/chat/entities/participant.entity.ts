import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../users/entities/user.entity';
import { ChatEntity } from './chat.entity';

export class ParticipantEntity {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID de la conversación',
  })
  conversationId: string;

  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'UUID del usuario participante',
  })
  userId: string;

  // Estas propiedades son opcionales según si haces "include" en Prisma
  @ApiProperty({ type: () => ChatEntity, required: false })
  conversation?: ChatEntity;

  @ApiProperty({ type: () => UserEntity, required: false })
  user?: UserEntity;

  constructor(partial: Partial<ParticipantEntity>) {
    Object.assign(this, partial);
  }

  get displayNames(): { username: string, email: string } | null {
    if (this.user?.username && this.user?.email) {
      return {username: this.user.username, email: this.user.email};
    }
    return null;
  }
}