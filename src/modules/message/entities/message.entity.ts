import { ApiProperty } from "@nestjs/swagger";

export class MessageEntity {
  @ApiProperty({ description: 'Unique identifier for the message' })
  id: string;
  @ApiProperty({ description: 'Content of the message' })
  content: string;
  @ApiProperty({ description: 'Indicates if the message has been read' })
  isRead: boolean;
  @ApiProperty({ description: 'Timestamp when the message was created' })
  createdAt: Date;
  
  // Relaciones
  @ApiProperty({ description: 'Identifier of the conversation this message belongs to' })
  conversationId: string;
  @ApiProperty({ description: 'Identifier of the user who sent the message' })
  senderId: string;

  constructor(partial: Partial<MessageEntity>) {
    Object.assign(this, partial);
  }
}