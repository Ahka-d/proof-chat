import { type UUID } from "crypto";
import { ApiProperty } from "@nestjs/swagger";

export class CreateChatDto {
    @ApiProperty({
        example: ['550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'],
        description: 'Lista de IDs de usuarios para el chat, formato UUID'
    })
    userIds: UUID[];
}

export class AddToChatDto {
    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'ID del usuario a agregar, formato UUID'
    })
    userId: UUID;

    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'ID de la conversación, formato UUID'
    })
    conversationId: UUID;
}
