import { ApiProperty } from '@nestjs/swagger';

export class MessageReadEntity {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID del mensaje que fue leído',
  })
  messageId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID del usuario que leyó el mensaje',
  })
  userId: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Fecha y hora en que el mensaje fue leído',
  })
  readAt: Date;

  constructor(partial: Partial<MessageReadEntity>) {
    Object.assign(this, partial);
  }
}