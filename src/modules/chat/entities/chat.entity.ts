import { ApiProperty } from '@nestjs/swagger';
import { ParticipantEntity } from './participant.entity';

export class ChatEntity {
  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID de la conversación' 
  })
  id: string;

  @ApiProperty({
    example: 'Chat de grupo',
    description: 'Título de la conversación (solo para grupos)',
    required: false,
  })
  title?: string | null;

  @ApiProperty({
    example: true,
    description: 'Indica si la conversación es un grupo o un chat privado',
  })
  isGroup: boolean;

  @ApiProperty({
    example: '2024-01-01T12:00:00Z',
    description: 'Fecha de creación de la conversación',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-02T12:00:00Z',
    description: 'Fecha de última actualización de la conversación',
  })
  updatedAt: Date;

  // Participantes de la conversación
  @ApiProperty({
    type: () => [ParticipantEntity],
    description: 'Lista de participantes en la conversación',
  })
  participants: any[];

  constructor(partial: Partial<ChatEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty({
    example: 'Team Chat',
    description: 'Nombre para mostrar de la conversación',
  })
  get displayName(): string {
    if (this.isGroup) {
      return this.title || 'Grupo sin nombre';
    } else {
      const otherParticipant = this.participants?.find(p => p.userId !== this.participants[0].userId);
      return otherParticipant?.user?.username || 'Grupo sin nombre';
    }
  }
}