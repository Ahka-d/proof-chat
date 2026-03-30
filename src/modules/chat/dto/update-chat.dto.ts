import {  MaxLength, MinLength, IsString } from "class-validator";
import { UUID } from "crypto";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateChatTitleDto {
  @ApiProperty({
    example: 'Friends Chat',
    description: 'Nuevo título para el chat, debe ser una cadena de texto entre 1 y 100 caracteres'
  })
  @IsString()
  @MaxLength(20, { message: 'Title must be at most 100 characters long' }) 
  @MinLength(1, { message: 'Title must be at least 1 character long' })
  title: string;
}
