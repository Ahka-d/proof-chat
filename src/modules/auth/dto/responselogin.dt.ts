import { type UUID } from "crypto";
import { ApiProperty } from '@nestjs/swagger';

export class ResponseLoginDto {
  @ApiProperty({ description: 'Token de acceso JWT' })
  access_token!: string;
  @ApiProperty({ description: 'Información del usuario autenticado' , type: Object })
  user!: {
    id: UUID;
    email: UUID;
    username: string;
  };
}